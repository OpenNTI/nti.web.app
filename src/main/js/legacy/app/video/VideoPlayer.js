const Ext = require('extjs');
const {getService} = require('nti-web-client');

const {default: Video} = require('nti-web-video');

require('legacy/overrides/ReactHarness');


module.exports = exports = Ext.define('NextThought.app.video.VideoPlayer', {
	extend: 'Ext.container.Container',
	alias: 'widget.content-video-player',

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

				this.videoPlayer = this.videoWrapper.add({
					xtype: 'react',
					component: Video,
					src: video,
					autoPlay: true,
					width: this.playerWidth,
					height: this.playerHeight,
					onTimeUpdate: (e) => this.onTimeUpdate(e),
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


	onTimeUpdate (e) {

	},


	onSeeked (e) {

	},


	onPlaying (e) {

	},


	onPause (e) {

	},


	onEnded (e) {

	},


	onError (e) {

	}
});
