var Ext = require('extjs');
var ContentUtils = require('../../../../util/Content');
var ParseUtils = require('../../../../util/Parsing');
var MixinsSearchable = require('../../../../mixins/Searchable');
var ReaderView = require('../reader/View');
var VideoVideo = require('../../../video/Video');
var VideoNavigation = require('../../../video/navigation/Video');
var {isFeature} = require('legacy/util/Globals');
const { encodeForURI } = require('nti-lib-ntiids');

module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.mode.SmallVideo', {
	extend: 'Ext.container.Container',
	alias: 'widget.media-transcript-viewer',

	mixins: {
		Searchable: 'NextThought.mixins.Searchable'
	},

	ui: 'media-viewer',
	viewerType: 'transcript-focus',
	border: false,
	plain: true,
	frame: false,

	statics: {
		getTargetVideoWidth: function (el, transcriptRatio) {
			return 512;
		}
	},

	transcriptRatio: 0.55,
	videoWidth: 512,
	cls: 'small-video-player',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'sync-button', cn: [
			{tag: 'span', html: 'sync with video', role: 'button'}
		]},
		{cls: 'video-player'},
		{id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out, values)%}']}
	]),

	layout: 'none',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	renderSelectors: {
		headerEl: '.header',
		gridViewEl: '.grid-view-body',
		videoPlayerEl: '.video-player',
		syncEl: '.sync-button'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.buildResourceView();
		this.enableBubble(['jump-video-to']);

		this.initSearch();
	},

	getContainerIdForSearch: function () {
		return this.video.getId();
	},

	showSearch: function (hit, fragIdx) {
		this.startAtMillis = hit.get('StartMilliSecs');
	},

	buildResourceView: function () {
		var me = this;

		this.resourceView = this.add({
			xtype: 'slidedeck-transcript',
			transcript: this.transcript,
			resourceList: this.resourceList,
			record: this.record,
			video: this.video,
			accountForScrollbars: false,
			scrollToId: this.scrollToId,
			videoPlaylist: [this.video],
			currentBundle: this.currentBundle,
			xhooks: {
				getScrollTarget: function () { return this.ownerCt.getTargetEl().dom; }
			}
		});

		this.mon(this.resourceView, 'presentation-parts-ready', 'onPresentationPartsReady', this);
		this.mon(this.resourceView, 'no-presentation-parts', 'onPresentationPartsReady', this);
		this.mon(this.resourceView, 'will-show-annotation', 'willShowAnnotation', this);
		this.mon(this.resourceView, 'will-hide-annotation', 'willHideAnnotation', this);
		this.mon(this.resourceView, 'unsync-video', 'unSyncVideo', this);

		wait(500)
			.then(function () {
				me.resourceView.maybeLoadData();
			});
	},

	afterRender: function () {
		this.callParent(arguments);
		this.syncVideo();
		this.mon(this.syncEl, 'click', 'syncVideo');

		Ext.defer(this.configureVideoPlayer, 300, this);
	},

	beforeDeactivate: function () {
		var shouldDeactivate = true;
		if (this.resourceView && this.resourceView.beforeDeactivate) {
			shouldDeactivate = this.resourceView.beforeDeactivate();
			if (shouldDeactivate === false) {
				return false;
			}
		}
	},

	allowNavigation: function () {
		if (this.videoplayer.isPlaying()) {
			this.videoplayer.pausePlayback();
			this.didPauseVideoPlayer = true;
		}

		if (this.resourceView) {
			return this.resourceView.allowNavigation();
		} else {
			return Promise.resolve();
		}
	},

	setNext: function (video) {
		this.nextVideo = video;

		if (this.videoPlayer) {
			this.videoPlayer.setNext(video);
		}
	},

	setPrev: function (video) {
		this.prevVideo = video;

		if (this.videoPlayer) {
			this.videoPlayer.setPrev(video);
		}
	},

	configureVideoPlayer: function () {
		var width = this.self.getTargetVideoWidth(this.getEl(), this.transcriptRatio),
			startTimeSeconds = (this.startAtMillis || 0) / 1000;

		this.videoplayer = Ext.widget('content-video-navigation', {
			playlist: [this.video],
			renderTo: this.videoPlayerEl,
			playerWidth: width,
			width: width,
			floatParent: this,
			nextVideo: this.nextVideo,
			prevVideo: this.prevVideo
		});

		this.on('destroy', 'destroy', this.videoplayer);

		if (isFeature('transcript-follow-video')) {
			this.mon(this.videoplayer, 'media-heart-beat', 'actOnMediaHeartBeat', this);
		}

		this.mon(this.videoplayer, {
			scope: this,
			'next-navigation-selected': 'videoNavigation',
			'prev-navigation-selected': 'videoNavigation'
		});

		if (this.record) {
			startTimeSeconds = this.getStartTime();
		}
		if (startTimeSeconds > 0) {
			this.startAtSpecificTime(startTimeSeconds, true);
		}

		this.on('jump-video-to', Ext.bind(this.videoplayer.jumpToVideoLocation, this.videoplayer), this);
	},


	getStartTime () {
		const range = this.record.get('applicableRange') || {};
		let startTimeSeconds;

		if(range && range.start) {
			let pointer = range.start || {};
			startTimeSeconds = pointer.seconds / 1000; //They are actually millis not seconds
		} else if (this.resourceList && !this.transcript) {
			let slides = this.resourceList.filter( resource => resource.xtype === 'slide-component' ).map( slidesCmp => slidesCmp.slide);

			for (let slide of slides) {
				if(slide.getId() === this.record.get('ContainerId')) {
					startTimeSeconds =  slide.get('video-start');
					break;
				}
			}
		}

		return startTimeSeconds;
	},

	adjustOnResize: function (availableHeight, availableWidth) {
		if (!this.resourceView) { return; }

		var videoWidth = this.videoPlayerEl.getWidth(),
			targetEl = this.getTargetEl(),
			transcriptWidth = Math.floor(availableWidth * this.transcriptRatio),
			tEl = this.el.down('.content-video-transcript'),
			top = this.videoPlayerEl.getTop() - targetEl.getTop();

		targetEl.setStyle('height', availableHeight + 'px');
		this.videoPlayerEl.setStyle('flex-basis', videoWidth + 'px');
		this.videoPlayerEl.setStyle('-webkit-flex-basis', videoWidth + 'px');
		this.videoPlayerEl.setStyle('-ms-flex-basis', videoWidth + 'px');
	},

	alignResourceViewNextToVideo: function (left, top) {
		var padding = 20,
			targetEl = this.getTargetEl();

		if (top > padding) {
			targetEl.setStyle('marginTop', top + 'px');
		}
		targetEl.setStyle('marginLeft', left + padding + 'px');
	},

	onPresentationPartsReady: function () {
		this.fireEvent('media-viewer-ready', this);
	},

	willShowAnnotation: function (annotationView) {
		if (!this.resourceView) { return;}

		var nWidth = annotationView.getWidth(),
			tBox = this.resourceView.getBox(),
			vWidth = Ext.dom.Element.getViewportWidth(),
			aWidth = vWidth - tBox.left - tBox.width,
			vl = aWidth - nWidth;

		if (vl < 0) {
			this.videoPlayerEl.setStyle('left', vl + 'px');
			this.getTargetEl().setStyle('left', vl + 'px');
		}
	},

	willHideAnnotation: function (annotationView) {
		this.videoPlayerEl.setStyle('left', '10px');
		this.getTargetEl().setStyle('left', '0px');
	},

	unSyncVideo: function () {
		var transcript = this.resourceView;
		this.syncWithTranscript = false;

		if (this.syncEl && this.resourceView) {
			this.syncEl.setLeft(this.resourceView.getX());
			this.syncEl.setWidth(this.resourceView.getWidth());
			this.syncEl.show();
		}
	},

	actOnMediaHeartBeat: function () {
		var state = this.videoplayer.queryPlayer(),
			time = state && state.time;

		if (!Ext.isEmpty(time) && this.resourceView && this.resourceView.highlightAtTime) {
			//The heartbeat happens every second, so if the range for a line to be highlighted
			//doesn't start on an exact second there is a delay with highlighting the next line.
			//Adding half a second to the time, cuts down on the delay.
			this.resourceView.highlightAtTime(time + 0.5, this.syncWithTranscript);
		}
	},

	startAtSpecificTime: function (time, isSeconds) {
		var startTimeSeconds = !isSeconds ? (time || 0) / 1000 : time;

		console.debug('Should scroll cmps to time: ', startTimeSeconds);
		if (this.videoplayer) {
			this.videoplayer.setVideoAndPosition(this.videoplayer.currentVideoId, startTimeSeconds);
		}

		if (this.resourceView) {
			this.resourceView.scrollToStartingTime(startTimeSeconds);
		}
	},

	syncVideo: function () {
		this.syncWithTranscript = true;

		if (this.syncEl) {
			this.syncEl.hide();
		}
	},

	getLocationInfo: function () {
		var me = this;

		return new Promise(function (fufill, reject) {
			ContentUtils.getLineage(me.video.get('NTIID'), this.ownerCt && this.ownerCt.currentBundle)
				.then(function (lineages) {
					var lineage = lineages[0];
					ContentUtils.getLocation(lineage.last(), bundle)
						.then(function (location) {
							me.setLocationInfo(location);
							fulfill(location);
						});
				})
				.catch(reject);
		});
	},

	videoNavigation: function (video) {
		if (!video) {
			return;
		}

		var ntiid = video && video.get('NTIID'),
			section = video && video.get('section'),
			route = section && encodeForURI(section) + '/video/' + encodeForURI(ntiid);

		if (!video.raw || !ntiid) {
			console.log('Dont know how to handle the navigation');
			return;
		}

		if (this.ownerCt && this.ownerCt.handleNavigation) {
			this.ownerCt.handleNavigation(video.get('title'), route, {video: video});
		}
	},

	beforeGridViewerShow: function () {
		if (this.videoplayer.isPlaying()) {
			this.videoplayer.pausePlayback();
			this.didPauseVideoPlayer = true;
		}
	},

	afterGridViewerHide: function () {
		if (this.didPauseVideoPlayer) {
			this.videoplayer.resumePlayback();
			delete this.didPauseVideoPlayer;
		}
	}
});
