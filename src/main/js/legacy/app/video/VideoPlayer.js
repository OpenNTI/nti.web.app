const Ext = require('extjs');
const {getService} = require('nti-web-client');
const {default: Video, UNSTARTED, ENDED, PLAYING, PAUSED, BUFFERING, CUED} = require('nti-web-video');

const AnalyticsUtil = require('../../util/Analytics');
const PageVisibility = require('../../util/Visibility');

require('legacy/overrides/ReactHarness');

const TIME_CHANGE_THRESHOLD = 5;

function getAnalyticMethods (doNotAllow, hasTranscript) {
	let hasWatch = false;
	let lastTime;

	return {
		start (state) {
			if (doNotAllow || hasWatch || !state) { return; }

			const {id, time, duration, speed} = state;

			AnalyticsUtil.getResourceTimer(id, {
				type: 'video-watch',
				'with_transcript': hasTranscript,
				'video_start_time': time,
				MaxDuration: duration / 1000,
				PlaySpeed: speed
			});

			hasWatch = true;
			PageVisibility.lockActive();
		},

		stop (state) {
			if (doNotAllow || !hasWatch || !state) { return; }

			const {id, time, duration} = state;

			AnalyticsUtil.stopResourceTimer(id, 'video-watch', {
				'video_end_time': time,
				MaxDuration: duration / 1000
			});

			hasWatch = false;
			PageVisibility.unlockActive();
		},


		onHeartBeat (state) {
			if (doNotAllow || !hasWatch || !state) { return; }

			const {id, time, state:playerState} = state;
			const diff = lastTime ? (time - lastTime) : 0;

			if (diff > TIME_CHANGE_THRESHOLD || diff < 0) {
				this.stop(state);
				this.start(state);

				if (playerState !== UNSTARTED) {
					AnalyticsUtil.getResourceTimer(id, {
						type: 'video-skip',
						'with_transcript': hasTranscript,
						'video_start_time': lastTime,
						'video_end_time': time
					});

					AnalyticsUtil.stopResourceTimer(id, 'video-skip');
				}
			}

			lastTime = time;
		}
	};
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
			CUED
		}
	},

	mixins: {
		instanceTracking: 'NextThought.mixins.InstanceTracking'
	},

	layout: 'none',
	items: [],

	ui: 'content-video',
	cls: 'content-video',

	ASPECT_RATIO: 0.5625,
	playerWidth: 640,

	getPlayerHeight () {
		//TODO: figure out if we need to add control height
		return Math.round(this.playerWidth * this.ASPECT_RATIO);
	},

	initComponent () {
		this.callParent(arguments);

		this.commandQueue = [];

		this.videoWrapper = this.add({
			xtype: 'container',
			cls: 'video-wrapper',
			layout: 'none',
			items: []
		});

		this.playerWidth = this.width || this.playerWidth;
		this.playerHeight = this.getPlayerHeight();

		this.trackThis();

		this.analytics = getAnalyticMethods(this.doNotCaptureAnalytics, !!this.up('media-view'));

		this.taskMediaHeartBeat = {
			interval: 1000,
			scope: this,
			run: () => {
				this.analytics.onHeartBeat(this.queryPlayer());
				this.fireEvent('media-heart-beat');
			},
			onError: (err) => console.error(err)
		};

		Ext.TaskManager.start(this.taskMediaHeartBeat);

		this.on({
			destroy: () => Ext.TaskManager.stop(this.taskMediaHeartBeat),
			beforedestroy: () => this.stopPlayback()
		});

	},


	afterRender () {
		this.callParent(arguments);

		this.maybeActivatePlayer();

		this.monitorCardChange();
	},


	getVideo () {
		this.videoPromise = this.videoPromise || getService().then(service => service.getObject(this.video.getId()));

		return this.videoPromise;
	},


	monitorCardChange () {
		const monitor = (cmp) => {
			const card = cmp.up('{isOwnerLayout("card")}');

			if (card) {
				this.mon(card, {
					activate: () => this.maybeActivatePlayer(),
					deactivate: () => this.deactivatePlayer()
				});

				monitor(card);
			}
		};

		monitor(this);
	},


	maybeActivatePlayer () {
		if (!this.isVisible(true)) { return; }

		const otherInstances = this.getInstances();

		otherInstances.forEach((instance) => {
			if (instance !== this) {
				instance.deactivatePlayer();
			}
		});

		if (!this.isActive) {
			this.activatePlayer();
		}
	},


	activatePlayer () {
		this.isActive = true;

		this.getVideo()
			.then((video) => {
				if (this.videoPlayer) {
					this.resumePlayback();
					return;
				}

				this.currentVideoId = video.getID();

				this.videoPlayer = this.videoWrapper.add({
					xtype: 'react',
					component: Video,
					src: video,
					autoPlay: true,
					width: this.playerWidth,
					height: this.playerHeight,
					onSeeked: (e) => this.onSeeked(e),
					onPlaying: (e) => this.onPlaying(e),
					onPause: (e) => this.onPause(e),
					onEnded: (e) => this.onEnded(e),
					onError: (e) => this.onError(e)
				});

				this.commandQueue.forEach(command => command());

				this.fireEvent('player-command-activate');
			});
	},


	deactivatePlayer () {
		delete this.isActive;

		this.pausePlayback();
		this.fireEvent('player-deactivated');
	},


	stopPlayback () {
		if (this.videoPlayer && this.videoPlayer.componentInstance) {
			this.videoPlayer.componentInstance.stop();
		} else {
			this.commandQueue.push(() => this.stopPlayback());
		}
	},


	pausePlayback () {
		if (this.videoPlayer && this.videoPlayer.componentInstance) {
			this.videoPlayer.componentInstance.pause();
		} else {
			this.commandQueue.push(() => this.pausePlayback());
		}
	},


	resumePlayback () {
		this.maybeActivatePlayer();

		if (this.videoPlayer && this.videoPlayer.componentInstance) {
			this.videoPlayer.componentInstance.play();
		} else {
			this.commandQueue.push(() => this.resumePlayback());
		}
	},


	jumpToVideoLocation (startAt) {
		if (this.videoPlayer && this.videoPLayer.componentInstance) {
			this.videoPlayer.componentInstance.setCurrentTime(startAt);
		} else {
			this.commandQueue.push(() => this.jumpToVideoLocation(startAt));
		}
	},


	queryPlayer () {
		if (!this.videoPlayer) { return null; }

		const state = this.videoPlayer.componentInstance.getPlayerState();

		return {video: this.currentVideoId, ...state};
	},


	onSeeked (e) {
		this.fireEvent('player-event-seeked');
	},


	onPlaying () {
		this.analytics.start(this.queryPlayer());

		this.fireEvent('player-event-play');
	},


	onPause () {
		this.analytics.stop(this.queryPlayer());

		this.fireEvent('player-event-paused');
	},


	onEnded () {
		this.analytics.stop(this.queryPlayer());

		this.fireEvent('player-event-ended');
	},


	onError (e) {
		this.fireEvent('player-error', e);
	}
});