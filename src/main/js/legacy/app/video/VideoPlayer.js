const Ext = require('extjs');
const {getService} = require('nti-web-client');
const {default: Video} = require('nti-web-video');

require('legacy/overrides/ReactHarness');


module.exports = exports = Ext.define('NextThought.app.video.VideoPlayer', {
	extend: 'Ext.container.Container',
	alias: 'widget.content-video-player',

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

		getService()
			.then((service) => service.getObject(this.video.getId()))
			.then((video) => {
				this.add({
					xtype: 'container',
					cls: 'video-wrapper',
					layout: 'none',
					items: [
						{
							xtype: 'react',
							component: Video,
							src: video,
							width: this.playerWidth,
							height: this.playerHeight,
							onTimeUpdate: e => this.onTimeUpdate(e),
							onSeeked: e => this.onSeeked(e),
							onPlaying: e => this.onPlaying(e),
							onPause: e => this.onPause(e),
							onEnded: e => this.onEnded(e),
							onError: e => this.onError(e)
						}
					]
				})

				this.videoPlayer = this.down('react');

				this.commandQueue.forEach(x => x());

				if (this.el) {
					this.el.unmask();
				}
			});

	},


	afterRender () {
		if (!this.videoPlayer) {
			this.el.mask('Loading...');
		}
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
		debugger;
	},


	onSeeked (e) {
		debugger;
	},


	onPlaying (e) {
		debugger;
	},


	onPause (e) {
		debugger;
	},


	onEnded (e) {
		debugger;
	},


	onError (e) {
		debugger;
	}
});
