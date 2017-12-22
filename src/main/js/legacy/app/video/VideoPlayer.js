const Ext = require('extjs');
const {getService} = require('nti-web-client');
//TODO: Use the Component named export of nti-web-video to get analytics by default...
const {default: Video, UNSTARTED, ENDED, PLAYING, PAUSED, BUFFERING, CUED} = require('nti-web-video');

const AnalyticsUtil = require('../../util/Analytics');
require('legacy/overrides/ReactHarness');

const TIME_CHANGE_THRESHOLD = 5;

//TODO: throw this away and use the analytics from the video player
function getAnalyticMethods (doNotAllow, hasTranscript) {
	let hasWatch = false;
	let lastTime;

	return {
		start (state) {
			if (doNotAllow || hasWatch || !state) { return; }

			const {video, time, duration, speed} = state;

			AnalyticsUtil.startEvent(video, {
				type: 'VideoWatch',
				withTranscript: hasTranscript,
				videoStartTime: time,
				duration: duration,
				playSpeed: speed
			});

			hasWatch = true;
		},

		stop (state) {
			if (doNotAllow || !hasWatch || !state) { return; }

			const {video, time, duration} = state;

			AnalyticsUtil.stopEvent(video, 'VideoWatch', {
				videoEndTime: time,
				duration: duration
			});

			hasWatch = false;
		},


		onHeartBeat (state) {
			if (doNotAllow || !hasWatch || !state) { return; }

			const {video, time, state:playerState} = state;
			const diff = lastTime ? (time - lastTime) : 0;

			if (diff > TIME_CHANGE_THRESHOLD || diff < 0) {
				this.stop(state);
				this.start(state);

				if (playerState !== UNSTARTED) {
					AnalyticsUtil.sendEvent(video, {
						type: 'VideoSkip',
						withTranscript: hasTranscript,
						videoStartTime: lastTime,
						videoEndTime: time
					});
				}
			}

			lastTime = time;
		},

		playbackRateChange (oldRate, newRate, state) {
			if (doNotAllow || !state) { return; }

			const {video, time} = state;

			AnalyticsUtil.sendEvent(video, {
				type: 'VideoSpeedChange',
				oldPlaySpeed: oldRate,
				newPlaySpeed: newRate,
				videoTime: time
			});
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

				if (!this.doNotAutoPlay) {
					this.analytics.start(this.queryPlayer());
				}
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
			this.analytics.stop(this.queryPlayer());
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
	},


	onRateChange (oldRate, newRate) {
		this.analytics.playbackRateChange(oldRate, newRate, this.queryPlayer());

		this.fireEvent('player-playback-rate-change');
	}
});
