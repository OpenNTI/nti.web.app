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
		width: 512,
		height: 288
	},

	BIGVIDEO:{
		width: 960,
		height: 540
	},

	renderTpl: Ext.DomHelper.markup([
		{cls:'header'},
		{cls:'video-player'},
		{id:'{id}-body', cls:'body', cn:['{%this.renderContainer(out, values)%}']}
	]),


	renderSelectors: {
		headerEl:'.header',
		videoPlayerEl: '.video-player'
	},


	initComponent:function(){
		this.callParent(arguments);

		// Add the transcript.
		this.add({
			xtype:'slidedeck-transcript',
			transcript:this.transcript
		});

		this.on('destory', 'destroy', this);
	},


	afterRender: function(){
		this.callParent(arguments);


		var me = this, h,
			targetEl = me.el.down('.body');

		Ext.getBody().addCls('media-viewer-open');
		this.toolbar = Ext.widget('media-toolbar', {renderTo:this.headerEl, video: this.video});

		this.addVideoPlayer(this.BIGVIDEO.width, this.BIGVIDEO.height);
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
		h  = Ext.Element.getViewportHeight() - this.toolbar.getHeight() - 30;
		h = h + 'px';
		Ext.defer(targetEl.setStyle, 1, targetEl, ['height',h]);
	},

	addVideoPlayer: function(width, height){
		this.videoplayer = Ext.widget('content-video',{
			playlist: [this.video],
			renderTo: this.videoPlayerEl,
			playerWidth: width,
			width: width,
			height: height
		});
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
		this.addVideoPlayer(dim.width, dim.height);
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