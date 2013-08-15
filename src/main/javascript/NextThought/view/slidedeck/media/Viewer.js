Ext.define('NextThought.view.slidedeck.media.Viewer', {
	extend: 'Ext.container.Container',
	alias: 'widget.media-viewer',
	requires:[
		'NextThought.view.slidedeck.media.Toolbar',
		'NextThought.view.slidedeck.Transcript',
		'NextThought.view.video.Video'
	],

	ui: 'media',
	floating: true,
	border: false,
	plain: true,
	frame: false,
	layout: 'auto',
	defaults:{
		border: false,
		plain:true,
		hideOnClick:true
	},

	SMALLVIDEO:{
		width: function(){return 512;}
	},

	BIGVIDEO:{
		width: function(el){
			var screenHeight = Ext.Element.getViewportHeight(),
				ratio = NextThought.view.video.Video.ASPECT_RATIO,
				defaultWidth = 960,
				defaultHeight = Math.round(defaultWidth * ratio),
				y = (el && el.getY()) || 0,
				diff = screenHeight - (y+defaultHeight),
				newWidth;


			if(diff >= 0){
				return defaultWidth;
			}

			newWidth = Math.round((1-(Math.abs(diff)/(screenHeight)))*defaultWidth);

			return Math.max(newWidth, 512);
		}
	},

	renderTpl: Ext.DomHelper.markup([
		{cls:'header'},
		{cls:'video-player'},
		{id:'{id}-body', cls:'body', cn:['{%this.renderContainer(out, values)%}']}
	]),


	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	renderSelectors: {
		headerEl:'.header',
		videoPlayerEl: '.video-player'
	},


	initComponent:function(){
		var me = this, keyMap;
        this.on('no-presentation-parts', function(){
			this.videoOnly = true;
			me.fireEvent('media-viewer-ready', me);
		}, this);

		this.callParent(arguments);

		this.add({
			xtype:'slidedeck-transcript',
			transcript: this.transcript,
			record: this.record,
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



		keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: this.destroy,
				scope: this
			}]
		});
		this.on('destroy',function(){keyMap.destroy(false);});
	},


	afterRender: function(){
		this.callParent(arguments);

		var videoWidth = this.BIGVIDEO.width(this.videoPlayerEl);
        if(this.videoOnly){
            this.el.addCls('video-only');
        }

		Ext.getBody().addCls('media-viewer-open');

		this.toolbar = Ext.widget({xtype:'media-toolbar', renderTo:this.headerEl, video: this.video, floatParent:this});
		this.identity = Ext.widget({xtype:'identity',renderTo: this.toolbar.getEl(), floatParent: this.toolbar});

		this.on('destroy','destroy',this.toolbar);
		this.on('destroy','destroy',this.identity);

		this.mon(this.identity,'profile-link-clicked','destroy');

		this.addVideoPlayer(videoWidth);
		this.activeVideoPlayerType = 'video-focus';

		this.mon(this.toolbar, {
			scope: this,
			'switch-video-viewer': 'switchVideoViewer'
		});

		this.mon(this.toolbar, 'exit-viewer', function(){
			console.log('about to exit the video viewer');
			this.destroy();
			this.fireEvent('exited', this);
		}, this);

		videoWidth += 80;
		this.getTargetEl().setStyle('marginLeft', videoWidth+'px');
		this.adjustOnResize();
		Ext.EventManager.onWindowResize(this.adjustOnResize, this, {buffer: 250});
	},


	adjustOnResize: function(){

		// Dimensions adjustments.
		var h = Ext.Element.getViewportHeight() - this.toolbar.getHeight() - 30,
			videoWidth = this.BIGVIDEO.width(this.videoPlayerEl),
			targetEl = this.getTargetEl();
		h = h + 'px';
		targetEl.setStyle('height', h);
		console.log('Media viewer resizing');
	},

	addVideoPlayer: function(width){
		var startTimeSeconds = (this.startAtMillis || 0) / 1000;
		this.videoplayer = Ext.widget('content-video',{
			playlist: [this.video],
			renderTo: this.videoPlayerEl,
			playerWidth: width,
			width: width,
			floatParent: this
		});

		if(this.record){
			var range = this.record.get('applicableRange') || {},
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


	switchVideoViewer: function(type){
		if(!type || this.activeVideoPlayerType === type){
			return;
		}
		console.log('switch to video viewer type: ', type);

		var me = this,
			isTranscriptCentric = type === 'transcript-focus',
			clsAction = isTranscriptCentric ? 'addCls':'removeCls',
			dim = isTranscriptCentric ? this.SMALLVIDEO : this.BIGVIDEO;

		// FIXME: This feels wrong, but I don't know if we can resize the video player once it's been created.
		// For now, naively destroy the current videoPlayer and add a new one with the desired dimensions.
		// TODO: We may also need to pass about the video in case it was currently playing.
		this.videoplayer.destroy();
		this.activeVideoPlayerType = type;
		this.addVideoPlayer(dim.width(this.videoPlayerEl));
		this.el[clsAction]('small-video-player');
		Ext.defer(function(){
			me.updateLayout();
		}, 10, me);
	},


	destroy: function(){
		this.toolbar.destroy();
		this.videoplayer.destroy();
		this.callParent(arguments);
		Ext.getBody().removeCls('media-viewer-open');
	}
});
