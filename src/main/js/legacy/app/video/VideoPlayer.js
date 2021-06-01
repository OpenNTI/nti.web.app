const Ext = require('@nti/extjs');
const { getService } = require('@nti/web-client');
//TODO: Use the Component named export of @nti/web-video to get analytics by default...
const {
	default: Video,
	Component: VideoWithAnalytics,
	UNSTARTED,
	ENDED,
	PLAYING,
	PAUSED,
	BUFFERING,
	CUED,
} = require('@nti/web-video');

const AnalyticsUtil = require('../../util/Analytics');
require('internal/legacy/overrides/ReactHarness');
require('internal/legacy/mixins/InstanceTracking');

async function resolveVideo(video) {
	const service = await getService();

	const href = video.get('href');

	if (href) {
		const object = await service.get(href);

		return service.getObject(object);
	}

	return service.getObject(video.getId());
}

module.exports = exports = Ext.define('NextThought.app.video.VideoPlayer', {
	extend: 'Ext.container.Container',
	alias: 'widget.content-video-player',

	inheritableStatics: {
		states: {
			UNSTARTED,
			ENDED,
			PLAYING,
			PAUSED,
			BUFFERING,
			CUED,
		},
	},

	mixins: {
		instanceTracking: 'NextThought.mixins.InstanceTracking',
	},

	layout: 'none',
	items: [],

	ui: 'content-video',
	cls: 'content-video',

	ASPECT_RATIO: 0.5625,
	playerWidth: 640,

	getPlayerHeight() {
		//TODO: figure out if we need to add control height
		return Math.round(this.playerWidth * this.ASPECT_RATIO);
	},

	initComponent() {
		this.callParent(arguments);

		this.commandQueue = [];

		this.videoWrapper = this.add({
			xtype: 'container',
			cls: 'video-wrapper',
			layout: 'none',
			items: [],
		});

		this.playerWidth = this.width || this.playerWidth;
		this.playerHeight = this.getPlayerHeight();

		this.trackThis();

		this.taskMediaHeartBeat = {
			interval: 1000,
			scope: this,
			run: () => {
				this.fireEvent('media-heart-beat');
				this.maybeSyncHeight();
			},
			onError: err => {
				Ext.TaskManager.stop(this.taskMediaHeartBeat);
				this.destroy();
				console.error(err);
			},
		};

		Ext.TaskManager.start(this.taskMediaHeartBeat);
	},

	beforeDestroy() {
		this.callParent(arguments);
		Ext.TaskManager.stop(this.taskMediaHeartBeat);
		this.stopPlayback();
	},

	afterRender() {
		this.callParent(arguments);

		this.maybeActivatePlayer();

		this.monitorCardChange();
	},

	maybeSyncHeight() {
		if (this.isDestroyed) {
			return;
		}

		const height = this.getHeight();

		if (height !== this.lastHeight) {
			this.fireEvent('height-change');
		}

		this.lastHeight = height;
	},

	getVideo() {
		if (!this.videoPromise) {
			this.videoPromise = this.video
				? resolveVideo(this.video)
				: Promise.resolve(this.src);
		}

		return this.videoPromise;
	},

	getAnalyticData(video) {
		return {
			resourceId: video?.getID?.(),
			context: AnalyticsUtil.getContext(),
			player_configuration: this.playerConfiguration,
			withTranscript: !!this.up('media-view'),
		};
	},

	monitorCardChange() {
		const monitor = cmp => {
			const card = cmp.up('{isOwnerLayout("card")}');

			if (card) {
				this.mon(card, {
					deactivate: () => this.deactivatePlayer(),
				});

				monitor(card);
			}
		};

		monitor(this);
	},

	isPlaying: function () {
		const { state } = this.queryPlayer() || {};

		return state === 1;
	},

	maybeActivatePlayer(e) {
		if (!this.isVisible(true)) {
			return;
		}

		const otherInstances = this.getInstances();

		otherInstances.forEach(instance => {
			if (instance !== this) {
				instance.deactivatePlayer();
			}
		});

		if (!this.isActive) {
			this.activatePlayer();
		}
	},

	activatePlayer() {
		this.isActive = true;

		if (this.videoPlayer) {
			this.resumePlayback();
			return;
		}

		this.getVideo().then(video => {
			this.currentVideoId = video.getID ? video.getID() : video;

			this.videoPlayer = this.videoWrapper.add({
				xtype: 'react',
				component:
					this.VideoComponentOverride ??
					(this.doNotCaptureAnalytics ? Video : VideoWithAnalytics),
				src: video,
				analyticsData: this.getAnalyticData(video),
				autoPlay: !this.doNotAutoPlay,
				deferred: this.deferred,
				width: this.playerWidth,
				height: this.playerHeight,
				onSeeked: e => this.onSeeked(e),
				onPlaying: e => this.onPlaying(e),
				onPause: e => this.onPause(e),
				onEnded: e => this.onEnded(e),
				onError: e => this.onError(e),
				onRateChange: (...args) => this.onRateChange(...args),
			});

			this.commandQueue.forEach(command => command());

			this.fireEvent('player-command-activate');
			this.maybeSyncHeight();

			// NTI-7776 - rely on the video to tell us when playback starts
			// if (!this.doNotAutoPlay) {
			// 	this.analytics.start(this.queryPlayer());
			// }
		});
	},

	deactivatePlayer() {
		delete this.isActive;

		this.pausePlayback();
		this.fireEvent('player-deactivated');
	},

	stopPlayback() {
		if (this.videoPlayer?.componentInstance) {
			this.videoPlayer.componentInstance.stop();
		} else {
			this.commandQueue.push(() => this.stopPlayback());
		}
	},

	pausePlayback() {
		if (this.videoPlayer && this.videoPlayer.componentInstance) {
			this.videoPlayer.componentInstance.pause();
		} else {
			this.commandQueue.push(() => this.pausePlayback());
		}
	},

	resumePlayback() {
		this.maybeActivatePlayer();

		if (this.videoPlayer && this.videoPlayer.componentInstance) {
			this.videoPlayer.componentInstance.play();
		} else {
			this.commandQueue.push(() => this.resumePlayback());
		}
	},

	jumpToVideoLocation(startAt) {
		if (this.videoPlayer && this.videoPlayer.componentInstance) {
			this.videoPlayer.componentInstance.setCurrentTime(startAt);
		} else {
			this.commandQueue.push(() => this.jumpToVideoLocation(startAt));
		}
	},

	queryPlayer() {
		if (!this.videoPlayer) {
			return null;
		}

		const state = this.videoPlayer.componentInstance.getPlayerState();

		return { video: this.currentVideoId, ...state };
	},

	onSeeked(e) {
		this.fireEvent('player-event-seeked');
	},

	onPlaying() {
		this.fireEvent('player-event-play');
	},

	onPause() {
		this.fireEvent('player-event-paused');
	},

	onEnded() {
		this.fireEvent('player-event-ended');
	},

	onError(e) {
		this.fireEvent('player-error', e);
		Ext.TaskManager.stop(this.taskMediaHeartBeat);
	},

	onRateChange(oldRate, newRate) {
		this.fireEvent('player-playback-rate-change');
	},
});
