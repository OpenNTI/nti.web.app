Ext.define('NextThought.view.slidedeck.media.Viewer', {
	extend: 'Ext.container.Container',
	alias: 'widget.media-viewer',
	requires: [
		'NextThought.view.slidedeck.media.GridView',
		'NextThought.view.slidedeck.media.Toolbar',
		'NextThought.view.slidedeck.Transcript',
		'NextThought.view.video.Video'
	],


	//<editor-fold desc="Config">
	ui: 'media',
	floating: true,
	border: false,
	plain: true,
	frame: false,
	layout: 'auto',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() { return this.body; },

	defaults: {
		border: false,
		plain: true,
		hideOnClick: true
	},


	renderTpl: Ext.DomHelper.markup([
		{cls: 'header'},
		{cls: 'grid-view-body'},
		{cls: 'video-player'},
		{id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out, values)%}']}
	]),


	renderSelectors: {
		headerEl: '.header',
		gridViewEl: '.grid-view-body',
		videoPlayerEl: '.video-player'
	},

	SMALLVIDEO: {
		width: function() {return 512;},
		transcriptRatio: 0.55,
		setClasses: function(el) {
			el.removeCls('full-video-player');
			el.addCls('small-video-player');
		}
	},


	BIGVIDEO: {
		transcriptRatio: 0.35,
		width: function(el, transcriptRatio) {
			var screenHeight = Ext.Element.getViewportHeight(),
				screenWidth = Ext.Element.getViewportWidth(),
				tWidth = Math.floor(screenWidth * (transcriptRatio || 0.35)),
				ratio = NextThought.view.video.Video.ASPECT_RATIO,
				defaultWidth = Ext.Element.getViewportWidth() - tWidth,
				defaultHeight = Math.round(defaultWidth * ratio),
				y = (el && el.getY()) || 0,
				diff = screenHeight - (y + defaultHeight),
				newWidth;


			if (diff >= 0) {
				return defaultWidth;
			}

			newWidth = Math.round((1 - (Math.abs(diff) / screenHeight)) * defaultWidth);

			return Math.max(newWidth, 512);
		},
		setClasses: function(el) {
			el.removeCls('full-video-player');
			el.removeCls('small-video-player');
		}
	},


	FULLVIDEO: {
		transcriptRatio: 0,
		width: function(el) {
			var screenHeight = Ext.Element.getViewportHeight(),
				screenWidth = Ext.Element.getViewportWidth(),
				ratio = NextThought.view.video.Video.ASPECT_RATIO,
				defaultWidth = screenWidth - 40,
				defaultHeight = Math.round(defaultWidth * ratio),
				y = (el && el.getY()) || 0,
				diff = screenHeight - (y + defaultHeight),
				newWidth;

			if (diff >= 0) { return defaultWidth; }

			newWidth = Math.round((screenHeight - y) / ratio);

			return Math.max(newWidth, 512);
		},
		left: function(width) {
			return 0;
		},
		setClasses: function(el, cmp) {
			var trans = cmp.down('slidedeck-transcript');
			if (trans) {
				trans.fireEvent('will-hide-transcript', cmp);
			}
			el.removeCls('small-video-player');
			el.addCls('full-video-player');
		}
	},
	//</editor-fold>


	//<editor-fold desc="Init">
	initComponent: function() {
		var me = this, keyMap, transcript;
    this.on('no-presentation-parts', function() {
			me.videoOnly = true;
			me.fireEvent('media-viewer-ready', me);
		}, this);

		this.callParent(arguments);

		if (this.transcript) {
			transcript = this.add({
				xtype: 'slidedeck-transcript',
				transcript: this.transcript,
				record: this.record,
				accountForScrollbars: false,
				scrollToId: this.scrollToId,
				videoPlaylist: [this.video],
				xhooks: {
					getScrollTarget: function() {
						return this.ownerCt.getTargetEl().dom;
					}
				},
				listeners: {
					'presentation-parts-ready': function() {me.fireEvent('media-viewer-ready', me);}
				}
			});

			transcript.mon(this, 'animation-end', 'onAnimationEnd');
			this.mon(transcript, {
				'will-show-annotation': 'willShowAnnotation',
				'will-hide-annotation': 'willHideAnnotation'
			});
		} else {
			this.noTranscript = true;
		}

		if (!Ext.isEmpty(this.startAtMillis)) {
			this.on('media-viewer-ready', Ext.bind(this.startAtSpecificTime, this, [this.startAtMillis]), this);
		}

		this.on('media-viewer-ready', 'adjustOnResize');
		if (!Ext.getBody().hasCls('media-viewer-open')) {
			Ext.getBody().mask('Loading...');
			this.animateIn();//will listen to afterRender
		} else {
			this.on('afterrender', Ext.bind(me.fireEvent, me, ['animation-end']), null, {single: true, buffered: 1000});
		}

		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: this.exitViewer,
				scope: this
			}]
		});
		this.on('destroy', function() {keyMap.destroy(false);});
	},


	afterRender: function() {
		var me = this, playerType;

		function cleanup() {
			Ext.getBody().removeCls('media-viewer-open media-viewer-closing');

			Ext.EventManager.removeResizeListener(me.adjustOnResize, me);
		}

		me.callParent(arguments);
		if (!Ext.getBody().hasCls('media-viewer-open')) {
			me.el.setStyle('visibility', 'hidden');//layout w/o flicker, animateIn will show it.
		}

		if (me.videoOnly) {
			me.el.addCls('video-only');
		}
		//check if we need to restore a type or use the default
		playerType = (me.noTranscript) ? 'full-video' : me.getStorageManager().get('media-viewer-player-type') || 'video-focus';

		//TODO: redo this. better.
		me.toolbar = Ext.widget({
			xtype: 'media-toolbar',
			renderTo: me.headerEl,
			currentType: playerType,
			video: me.video,
			floatParent: me,
			noTranscript: me.noTranscript
		});
		me.identity = Ext.widget({xtype: 'identity', renderTo: me.toolbar.getEl(), floatParent: me.toolbar});
		me.gridView = Ext.widget({xtype: 'media-grid-view', renderTo: me.gridViewEl, floatParent: me, source: me.video});

		me.on('destroy', 'destroy', me.toolbar);
		me.on('destroy', 'destroy', me.gridView);
		me.on('destroy', 'destroy', me.identity);
		me.on('exit-viewer', 'exitViewer', me);
		me.on('destroy', cleanup, me);

		me.switchVideoViewer(playerType);

		me.mon(me.gridView, {
			'hide-grid': {fn: 'showGridPicker', scope: me.toolbar},
			'store-set': 'listStoreSet'
		});

		me.mon(me.toolbar, {
			'switch-video-viewer': 'switchVideoViewer',
			'hide-grid-viewer': 'hideGridViewer',
			'show-grid-viewer': 'showGridViewer'
		});

		me.adjustOnResize();
		Ext.EventManager.onWindowResize(me.adjustOnResize, me, {buffer: 250});
	},


	getStorageManager: function() {
		return TemporaryStorage;
	},


	listStoreSet: function(store) {
		if (!store) { return; }
		var me = this, index = store.indexOf(this.video);

		function isHeader(video) {
			return video && video.get('sources') && video.get('sources').length === 0;
		}

		function getPrevFromIndex(i) {
			var prev;

			if ((i - 1) >= 0) {
				prev = store.getAt(i - 1);
			}

			if (isHeader(prev)) {
				prev = getPrevFromIndex(i - 1);
			}

			return prev;
		}

		function getNextFromIndex(i) {
			var next;

			if ((i + 1) < store.getCount()) {
				next = store.getAt(i + 1);
			}

			if (isHeader(next)) {
				next = getNextFromIndex(i + 1);
			}

			return next;
		}

		this.prevVideo = getPrevFromIndex(index);
		this.nextVideo = getNextFromIndex(index);

		if (this.videoplayer) {
			this.videoplayer.setPrev(this.prevVideo);
			this.videoplayer.setNext(this.nextVideo);
		}
	},

	getLocationInfo: function() {
		var ntiid = this.video && this.video.get('NTIID'),
			lineage = ntiid && ContentUtils.getLineage(ntiid);

		return lineage && lineage.last() && ContentUtils.getLocation(lineage.last());
	},

	videoNavigation: function(video) {
		if (!video) {
			return;
		}

		var li = this.getLocationInfo(),
			ntiid = video && video.get('NTIID');

		if (!li || !video.raw || !ntiid) {
			console.log('Dont know how to handle the navigation');
			return;
		}

		Ext.defer(this.fireEvent, 1, this, ['change-media-in-player', video.raw, ntiid, getURL(li.root)]);
	},


	addVideoPlayer: function(width, left) {
		var startTimeSeconds = (this.startAtMillis || 0) / 1000,
			range, pointer;

		//When the navigation stuff is ready switch this to the 'content-video-navigation' widget
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
			range = this.record.get('applicableRange') || {};
			pointer = range.start || {};

			startTimeSeconds = pointer.seconds / 1000; //They are actually millis not seconds
		}
		if (startTimeSeconds > 0) {
			this.videoplayer.setVideoAndPosition(this.videoplayer.currentVideoId, startTimeSeconds);
		}

    this.on('jump-video-to', Ext.bind(this.videoplayer.jumpToVideoLocation, this.videoplayer), this);
	},


	startAtSpecificTime: function(time, isSeconds) {
		var startTimeSeconds = !isSeconds ? (time || 0) / 1000 : time,
			transcriptCmp = this.down('slidedeck-transcript');

		console.debug('Should scroll cmps to time: ', startTimeSeconds);
		if (this.videoplayer) {
			this.videoplayer.setVideoAndPosition(this.videoplayer.currentVideoId, startTimeSeconds);
		}

		if (transcriptCmp) {
			transcriptCmp.scrollToStartingTime(startTimeSeconds);
		}
	},
	//</editor-fold>

	actOnMediaHeartBeat: function() {
		var transcriptCmp = this.down('slidedeck-transcript'),
			state = this.videoplayer.queryPlayer(),
			time = state && state.time,
			data = time && time.data;

		if (!Ext.isEmpty(data) && transcriptCmp && transcriptCmp.highlightAtTime) {
			//The heartbeat happens every second, so if the range for a line to be highlighted
			//doesn't start on an exact second there is a delay with highlighting the next line.
			//Adding half a second to the time, cuts down on the delay.
			transcriptCmp.highlightAtTime(data[0] + 0.5);
		}
	},


	animateIn: function() {
		var me = this;
		if (!this.rendered) {
			this.on('afterrender', 'animateIn', this, {buffer: 300});
			return;
		}

		Ext.getBody().addCls('media-viewer-open');
		this.addCls('ready');
		this.el.setStyle('visibility', 'visible');
		Ext.getBody().unmask();
		//TODO use the animationend event for the browsers that support it
		Ext.defer(this.fireEvent, 1100, this, ['animation-end']);
	},


	exitViewer: function() {
		console.log('about to exit the video viewer');
		var annotation = this.down('annotation-view'),
			transcript = this.down('slidedeck-transcript'),
			noteOverlay = transcript && transcript.noteOverlay,
			editor = noteOverlay && noteOverlay.editor;

		if (transcript && !transcript.fireEvent('beforedestroy')) {
			return;
		}

		Ext.getBody().removeCls('media-viewer-open').addCls('media-viewer-closing');
		this.removeCls('ready');
		this.addCls('closing');

		if (annotation && annotation.destroy()) {
			annotation.destroy();
		}


		Ext.defer(this.destroy, 1100, this);
		Ext.defer(this.fireEvent, 1100, this, ['exited', this]);
	},


	//<editor-fold desc="Handlers">
	adjustOnResize: function() {

		// TODO: this dimensions adjustment stuff is getting nasty. We need to do it the better way.
		// Part of what's making is harder, is that we need to be aware of the viewport dimensions
		// while at the same time making sure we sync with resizes.
		var tbHeight = (this.toolbar.el && this.toolbar.getHeight()) || 0,
			h = Ext.Element.getViewportHeight() - tbHeight - 30,
			videoWidth = this.videoPlayerEl.getWidth(),
			targetEl = this.getTargetEl(),
			dim = this.el.hasCls('small-video-player') ? this.SMALLVIDEO : (this.el.hasCls('full-video-player')) ? this.FULLVIDEO : this.BIGVIDEO,
			transcriptWidth = Math.floor(Ext.Element.getViewportWidth() * dim.transcriptRatio),
			tEl = this.el.down('.content-video-transcript');

		targetEl.setStyle('height', h + 'px');
		if (tEl) {
			if (transcriptWidth > 80) {
				transcriptWidth -= 80;
				tEl.parent('.transcript-view').show();
				tEl.setStyle('width', transcriptWidth + 'px');
			}else {
				tEl.parent('.transcript-view').hide();
			}
			videoWidth += 80;
			this.getTargetEl().setStyle('marginLeft', videoWidth + 'px');
		}
		console.log('Media viewer resizing');
	},


	willShowAnnotation: function(annotationView) {
		var nWidth = annotationView.getWidth(),
			tBox = this.down('slidedeck-transcript').getBox(),
			vWidth = Ext.dom.Element.getViewportWidth(),
			aWidth = vWidth - tBox.left - tBox.width,
			vl = aWidth - nWidth;

		if (vl < 0) {
			this.videoPlayerEl.setStyle('left', vl + 'px');
			this.getTargetEl().setStyle('left', vl + 'px');
		}
	},


	willHideAnnotation: function(annotationView) {
		this.videoPlayerEl.setStyle('left', '10px');
		this.getTargetEl().setStyle('left', '0px');
	},


	switchVideoViewer: function(type) {
		if (!type || this.activeVideoPlayerType === type) {
			return;
		}
		console.log('switch to video viewer type: ', type);

		var me = this,
			isTranscriptCentric = type === 'transcript-focus',
			isFullVideo = type === 'full-video',
			dim = isTranscriptCentric ? this.SMALLVIDEO : (isFullVideo ? this.FULLVIDEO : this.BIGVIDEO),
			width = dim.width(this.videoPlayerEl),
			left = Ext.isFunction(dim.left) && dim.left(width);

		//store the current type so we can retreive it later
		me.getStorageManager().set('media-viewer-player-type', type);
		// FIXME: This feels wrong, but I don't know if we can resize the video player once it's been created.
		// For now, naively destroy the current videoPlayer and add a new one with the desired dimensions.
		// TODO: We may also need to pass about the video in case it was currently playing.
		if (this.videoplayer) { this.videoplayer.destroy(); }
		this.activeVideoPlayerType = type;
		this.addVideoPlayer(width, left);
		dim.setClasses(this.el, this);
		Ext.defer(function() {
			me.adjustOnResize();
			if (me.down('slidedeck-transcript')) {
				me.down('slidedeck-transcript').fireEvent('sync-height');
			}
		}, 1, me);
	},


	hideGridViewer: function() {
		if (this.gridViewEl) {
			this.gridViewEl.removeCls('active');
			if (this.didPauseVideoPlayer) {
				this.videoplayer.resumePlayback();
				delete this.didPauseVideoPlayer;
			}
		}
	},


	showGridViewer: function() {
		if (!this.gridViewEl) {
			return;
		}

		var v = this.down('slidedeck-transcript');
		if (v) {
			v.mayBeHideAnnotationView();
		}

		if (this.videoplayer.isPlaying()) {
			this.videoplayer.pausePlayback();
			this.didPauseVideoPlayer = true;
		}
		this.gridViewEl.addCls('active');
	}
	//</editor-fold>
});
