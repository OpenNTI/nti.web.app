/*jslint */
/*globals SlideDeck */
Ext.define('NextThought.view.slidedeck.slidevideo.SlideVideo',{
	extend: 'Ext.Component',
	alias: 'widget.content-slidevideo',

	requires:[
		'NextThought.webvtt.Transcript',
		'NextThought.webvtt.Cue',
		'NextThought.view.video.transcript.Window',
		'NextThought.view.video.transcript.OverlayedPanel'
	],

	ui: 'content-slidevideo',
	cls: 'content-slidevideo',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style:{ backgroundImage: 'url({thumbnail})'} },
		{ cls: 'meta', cn: [
			{ cls:'title', html:'{title}' },
			{ cls:'byline', html:'By {creator}' },
			{ cls:'description', html:'{description}' },
			{ cls:'presentation-button', html:'View Presentation' },
			{ tag:'tpl', 'if':'hasTranscript', cn:[
				{ cls:'video-transcript-button', html: 'View Transcript', 'data-source':'{transcript.url}'}
			]}
		]}
	]),


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},this.data);
		this.target = this.data.href;
		this.transcript = this.data.transcript;
		this.renderData = Ext.apply(this.renderData, {
			hasTranscript: !Ext.isEmpty(this.transcript)
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click','onSlideVideoClicked',this);
	},


	onSlideVideoClicked: function(e){
		if(e.getTarget('.video-transcript-button')){
			if(e.getTarget('.showing')){
				this.hideTranscript(e);
				return;
			}
			this.openVideoTranscript(e);
			return;
		}
		 SlideDeck.open(this.contentElement, this.reader);
	},

	getTranscriptJsonUrl: function(){
		return this.transcript.basePath + this.transcript.jsonUrl;
	},


	getTranscriptUrl: function(){
		return this.transcript.basePath + this.transcript.url;
	},


	openVideoTranscript: function(e){
		console.log('Should open transcript', this.transcript );
		e.stopEvent();


		function transcriptLoadFinish(text){
			var t = NextThought.view.video.transcript.Transcript.processTranscripts(text),
				contentEl = me.transcript && me.transcript.contentElement && Ext.get(me.transcript.contentElement),
				guid = guidGenerator(),
				panel = Ext.widget('video-transcript-overlay', {
					textContent: t,
					reader: me.reader,
					renderTo: me.reader.componentOverlayEl,
					contentElement: contentEl
				});

			me.reader.getComponentOverlay().registerOverlayedPanel(guid+'video-transcript-overlay', panel);
			me.transcriptOverlayPanel = panel;
			me.showTranscript();
		}

		var me = this,
			proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

		if(!Ext.isEmpty(this.transcriptOverlayPanel)){
			this.showTranscript();
			return;
		}

		proxy.request({
			jsonpUrl: this.getTranscriptJsonUrl(),
			url: this.getTranscriptUrl(),
			expectedContentType: this.transcript.type,
			scope:this,
			success: function(res, req){
				console.log('SUCCESS Loading Transcripts: ', arguments);
				Ext.callback(transcriptLoadFinish, me, [res.responseText]);
			},
			failure: function(){
				console.log('FAILURE Loading Transcripts: ', arguments);
			}
		});
	},


	showTranscript: function(){
		if(this.transcriptOverlayPanel){
			this.transcriptOverlayPanel.show();
			this.el.down('.video-transcript-button').update('Hide Transcript').addCls('showing');
		}
	},


	hideTranscript: function(e){
		if(this.transcriptOverlayPanel){
			this.transcriptOverlayPanel.hide();
			this.el.down('.video-transcript-button').update('View Transcript').removeCls('showing');
		}
	},


	showVideoTranscriptWindow: function(html){
		var win = Ext.widget('video-transcript-window', {textContent: html});
		win.show();
		SlideDeck.open(this.contentElement, this.reader);
	}
});
