const Ext = require('extjs');
const {getService} = require('nti-web-client');
const {Component: Video, UNSTARTED, ENDED, PLAYING, PAUSED, BUFFERING, CUED} = require('nti-web-video');

const AnalyticsUtil = require('../../util/Analytics');

require('legacy/overrides/ReactHarness');


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

		this.withTranscripts = !!this.up('media-view');

		this.taskMediaHeartBeat = {
			interval: 1000,
			scope: this,
			run: () => {
				this.fireEvent('media-heart-beat');
				this.maybeSyncHeight();
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


	maybeSyncHeight () {
		const height = this.getHeight();

		if (height !== this.lastHeight) {
			this.fireEvent('height-change');
		}

		this.lastHeight = height;
	},


	getVideo () {
		if (!this.videoPromise) {
			this.videoPromise = this.video ?
				getService().then(service => service.getObject(this.video.getId())) :
				Promise.resolve(this.src);
		}

		return this.videoPromise;
	},


	monitorCardChange () {
		const monitor = (cmp) => {
			const card = cmp.up('{isOwnerLayout("card")}');

			if (card) {
				this.mon(card, {
					deactivate: () => this.deactivatePlayer()
				});

				monitor(card);
			}
		};

		monitor(this);
	},


	maybeActivatePlayer (e) {
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

		if (this.videoPlayer) {
			this.resumePlayback();
			return;
		}

		this.getVideo()
			.then((video) => {
				this.currentVideoId = video.getID ? video.getID() : video;

				this.videoPlayer = this.videoWrapper.add({
					xtype: 'react',
					component: Video,
					src: video,
					autoPlay: !this.doNotAutoPlay,
					width: this.playerWidth,
					height: this.playerHeight,
					analyticsData: {
						context: AnalyticsUtil.getContext(),
						resourceId: this.currentVideoId,
						withTranscripts: this.withTranscripts,
					},
					onSeeked: (e) => this.onSeeked(e),
					onPlaying: (e) => this.onPlaying(e),
					onPause: (e) => this.onPause(e),
					onEnded: (e) => this.onEnded(e),
					onError: (e) => this.onError(e),
					onRateChange: (...args) => this.onRateChange(...args)
				});

				this.commandQueue.forEach(command => command());

				this.fireEvent('player-command-activate');
				this.maybeSyncHeight();
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
		if (this.videoPlayer && this.videoPlayer.componentInstance) {
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
		this.fireEvent('player-event-play');
	},


	onPause () {
		this.fireEvent('player-event-paused');
	},


	onEnded () {
		this.fireEvent('player-event-ended');
	},


	onError (e) {
		this.fireEvent('player-error', e);
	},


	onRateChange (oldRate, newRate) {
		this.fireEvent('player-playback-rate-change');
	}
});
