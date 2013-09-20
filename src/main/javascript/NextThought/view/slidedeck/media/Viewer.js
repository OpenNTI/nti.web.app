Ext.define('NextThought.view.slidedeck.media.Viewer', {
	extend: 'Ext.container.Container',
	alias: 'widget.media-viewer',
	requires:[
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
	getTargetEl: function () { return this.body; },

	defaults:{
		border: false,
		plain:true,
		hideOnClick:true
	},


	renderTpl: Ext.DomHelper.markup([
		{cls:'header'},
		{cls:'grid-view-body'},
		{cls:'video-player'},
		{id:'{id}-body', cls:'body', cn:['{%this.renderContainer(out, values)%}']}
	]),


	renderSelectors: {
		headerEl:'.header',
		gridViewEl:'.grid-view-body',
		videoPlayerEl: '.video-player'
	},

	SMALLVIDEO:{
		width: function(){return 512;},
		transcriptRatio: 0.55,
		setClasses: function(el){
			el.removeCls('full-video-player');
			el.addCls('small-video-player');
		}
	},


	BIGVIDEO:{
		transcriptRatio: 0.35,
		width: function(el, transcriptRatio){
			var screenHeight = Ext.Element.getViewportHeight(),
				screenWidth = Ext.Element.getViewportWidth(),
				tWidth = Math.floor(screenWidth * (transcriptRatio || 0.35)),
				ratio = NextThought.view.video.Video.ASPECT_RATIO,
				defaultWidth = Ext.Element.getViewportWidth() - tWidth,
				defaultHeight = Math.round(defaultWidth * ratio),
				y = (el && el.getY()) || 0,
				diff = screenHeight - (y+defaultHeight),
				newWidth;


			if(diff >= 0){
				return defaultWidth;
			}

			newWidth = Math.round((1-(Math.abs(diff)/(screenHeight)))*defaultWidth);

			return Math.max(newWidth, 512);
		},
		setClasses: function(el){
			el.removeCls('full-video-player');
			el.removeCls('small-video-player');
		}
	},


	FULLVIDEO:{
		transcriptRatio: 0,
		width: function(el){
			var screenHeight = Ext.Element.getViewportHeight(),
				screenWidth = Ext.Element.getViewportWidth(),
				ratio = NextThought.view.video.Video.ASPECT_RATIO,
				defaultWidth = screenWidth - 40,
				defaultHeight = Math.round(defaultWidth * ratio),
				y = (el && el.getY()) || 0,
				diff = screenHeight - (y + defaultHeight),
				newWidth;
				
			if(diff >= 0){ return defaultWidth; }

			newWidth = Math.round( (screenHeight - y) / ratio);

			return Math.max(newWidth, 512);
		},
		left: function(width){
			return 0;
		},
		setClasses: function(el, cmp){
			var trans = cmp.down('slidedeck-transcript');
			if(trans){
				trans.fireEvent('will-hide-transcript', cmp);
			}
			el.removeCls('small-video-player');
			el.addCls('full-video-player');
		}
	},
	//</editor-fold>


	//<editor-fold desc="Init">
	initComponent:function(){
		var me = this, keyMap;
        this.on('no-presentation-parts', function(){
			me.videoOnly = true;
			me.fireEvent('media-viewer-ready', me);
		}, this);

		this.callParent(arguments);

		this.add({
			xtype:'slidedeck-transcript',
			transcript: this.transcript,
			record: this.record,
			scrollToId: this.scrollToId,
			videoPlaylist: [this.video],
			xhooks: {
				getScrollTarget: function(){
					return this.ownerCt.getTargetEl().dom;
				}
			},
			listeners: {
				'presentation-parts-ready': function(){me.fireEvent('media-viewer-ready', me);}
			}
		});

        if(!Ext.isEmpty(this.startAtMillis)){
            this.on('media-viewer-ready', Ext.bind(this.startAtSpecificTime, this, [this.startAtMillis]), this);
        }
		this.on('media-viewer-ready', 'adjustOnResize');
		this.on('media-viewer-ready', 'animateIn');

		this.mon(this.down('slidedeck-transcript'), {
			'will-show-annotation': 'willShowAnnotation',
			'will-hide-annotation': 'willHideAnnotation'
		});

		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: this.exitViewer,
				scope: this
			}]
		});
		this.on('destroy',function(){keyMap.destroy(false);});
	},


	afterRender: function(){
		var me = this;

		function cleanup(){
			Ext.getBody().removeCls('media-viewer-open media-viewer-closing');
			Ext.EventManager.removeResizeListener(me.adjustOnResize, me);
		}

		me.callParent(arguments);
		me.el.setStyle('visibility','hidden');//layout w/o flicker, animateIn will show it.

        if(me.videoOnly){
            me.el.addCls('video-only');
        }


		me.toolbar = Ext.widget({xtype:'media-toolbar', renderTo:me.headerEl, video: me.video, floatParent:me});
		me.identity = Ext.widget({xtype:'identity',renderTo: me.toolbar.getEl(), floatParent: me.toolbar});
		me.gridView = Ext.widget({xtype:'media-grid-view',renderTo: me.gridViewEl, floatParent: me, source: me.video});

		me.on('destroy','destroy', me.toolbar);
		me.on('destroy','destroy', me.gridView);
		me.on('destroy','destroy', me.identity);
		me.on('exit-viewer', 'exitViewer', me);
		me.on('destroy', cleanup, me);

		me.addVideoPlayer(me.BIGVIDEO.width(me.videoPlayerEl));
		me.activeVideoPlayerType = 'video-focus';

		me.mon(me.toolbar, {
			'switch-video-viewer': 'switchVideoViewer',
			'hide-grid-viewer': 'hideGridViewer',
			'show-grid-viewer': 'showGridViewer'
		});

		me.adjustOnResize();
		Ext.EventManager.onWindowResize(me.adjustOnResize, me, {buffer: 250});
	},


	addVideoPlayer: function(width, left){
		var startTimeSeconds = (this.startAtMillis || 0) / 1000,
			range, pointer;

		this.videoplayer = Ext.widget('content-video',{
			playlist: [this.video],
			renderTo: this.videoPlayerEl,
			playerWidth: width,
			width: width,
			floatParent: this
		});
		this.on('destroy','destroy',this.videoplayer);

		if(this.record){
			range = this.record.get('applicableRange') || {};
			pointer = range.start || {};

			startTimeSeconds = pointer.seconds / 1000; //They are actually millis not seconds
		}
		if(startTimeSeconds > 0){
			this.videoplayer.setVideoAndPosition(this.videoplayer.currentVideoId, startTimeSeconds);
		}

        this.on('jump-video-to', Ext.bind(this.videoplayer.jumpToVideoLocation, this.videoplayer), this);
	},


	startAtSpecificTime: function(time, isSeconds){
		var startTimeSeconds = !isSeconds ? (time || 0)/1000 : time,
			transcriptCmp =  this.down('slidedeck-transcript');

		console.debug('Should scroll cmps to time: ', startTimeSeconds);
		if(this.videoplayer){
			this.videoplayer.setVideoAndPosition(this.videoplayer.currentVideoId, startTimeSeconds);
		}

		if(transcriptCmp){
			transcriptCmp.scrollToStartingTime(startTimeSeconds);
		}
	},
	//</editor-fold>


	animateIn: function(){
		if(!this.rendered){
			this.on('afterrender','animateIn',this, {buffer:100});
			return;
		}

		Ext.getBody().addCls('media-viewer-open');
		this.addCls('ready');
		this.el.setStyle('visibility','visible');
	},


	exitViewer: function(){
		console.log('about to exit the video viewer');

		Ext.getBody().removeCls('media-viewer-open').addCls('media-viewer-closing');
		this.removeCls('ready');
		this.addCls('closing');
		Ext.defer(this.destroy,1100,this);
		Ext.defer(this.fireEvent,1100,this,['exited', this]);
	},


	//<editor-fold desc="Handlers">
	adjustOnResize: function(){

		// TODO: this dimensions adjustment stuff is getting nasty. We need to do it the better way.
		// Part of what's making is harder, is that we need to be aware of the viewport dimensions
		// while at the same time making sure we sync with resizes.
		var tbHeight = (this.toolbar.el && this.toolbar.getHeight()) || 0,
			h = Ext.Element.getViewportHeight() -  tbHeight - 30,
			videoWidth = this.videoPlayerEl.getWidth(),
			targetEl = this.getTargetEl(),
			dim = this.el.hasCls('small-video-player') ? this.SMALLVIDEO : (this.el.hasCls('full-video-player'))? this.FULLVIDEO : this.BIGVIDEO,
			transcriptWidth = Math.floor(Ext.Element.getViewportWidth() * dim.transcriptRatio),
			tEl = this.el.down('.content-video-transcript');

		targetEl.setStyle('height', h+'px');
		if(tEl){
			if(transcriptWidth > 80){
				transcriptWidth -= 80;
				tEl.parent('.transcript-view').show();
				tEl.setStyle('width', transcriptWidth+'px');
			}else{
				tEl.parent('.transcript-view').hide();
			}
			videoWidth += 80;
			this.getTargetEl().setStyle('marginLeft', videoWidth+'px');
		}
		console.log('Media viewer resizing');
	},


	willShowAnnotation: function(annotationView){
		var nWidth = annotationView.getWidth(),
			tBox = this.down('slidedeck-transcript').getBox(),
			vWidth = Ext.dom.Element.getViewportWidth(),
			aWidth = vWidth - tBox.left - tBox.width,
			vl = aWidth - nWidth;

		if(vl < 0){
			this.videoPlayerEl.setStyle('left', vl+'px');
			this.getTargetEl().setStyle('left', vl + 'px');
		}
	},


	willHideAnnotation: function(annotationView){
		this.videoPlayerEl.setStyle('left', '10px');
		this.getTargetEl().setStyle('left', '0px');
	},


	switchVideoViewer: function(type){
		if(!type || this.activeVideoPlayerType === type){
			return;
		}
		console.log('switch to video viewer type: ', type);

		var cls, me = this,
			isTranscriptCentric = type === 'transcript-focus',
			isFullVideo = type === 'full-video',
			dim = isTranscriptCentric ? this.SMALLVIDEO : (isFullVideo? this.FULLVIDEO : this.BIGVIDEO),
			width = dim.width(this.videoPlayerEl),
			left = Ext.isFunction(dim.left) && dim.left(width);

		// FIXME: This feels wrong, but I don't know if we can resize the video player once it's been created.
		// For now, naively destroy the current videoPlayer and add a new one with the desired dimensions.
		// TODO: We may also need to pass about the video in case it was currently playing.
		this.videoplayer.destroy();
		this.activeVideoPlayerType = type;
		this.addVideoPlayer(width, left);
		dim.setClasses(this.el, this);
		Ext.defer(function(){
			me.adjustOnResize();
			if(me.down('slidedeck-transcript')){
				me.down('slidedeck-transcript').fireEvent('sync-height');
			}
		}, 1, me);
	},


	hideGridViewer: function(){
		if( this.gridViewEl ){
			this.gridViewEl.removeCls('active');
			if(this.didPauseVideoPlayer){
				this.videoplayer.resumePlayback();
				delete this.didPauseVideoPlayer;
			}
		}
	},


	showGridViewer: function(){
		if( !this.gridViewEl ){
			return;
		}

		var v = this.down('slidedeck-transcript');
		if( v ){
			v.mayBeHideAnnotationView();
		}

		if(this.videoplayer.isPlaying()){
			this.videoplayer.pausePlayback();
			this.didPauseVideoPlayer = true;
		}
		this.gridViewEl.addCls('active');
	}
	//</editor-fold>
});
