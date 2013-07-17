Ext.define('NextThought.view.slidedeck.Transcript', {
	extend: 'NextThought.view.content.Base', //'Ext.container.Container',
	alias: 'widget.slidedeck-transcript',
	requires:[
		'NextThought.layout.component.Natural',
		'NextThought.view.video.transcript.Transcript',
		'NextThought.view.content.reader.NoteOverlay',
		'NextThought.view.slidedeck.transcript.NoteOverlay',
		'NextThought.view.slidedeck.transcript.Slide'
	],

	ui:'transcript',
	cls:'transcript-view',

	layout: 'auto',
//	componentLayout: 'natural',
	childEls: ['body'],

	getTargetEl: function () { return this.body; },
	renderTpl: Ext.DomHelper.markup([
		{id: '{id}-body', cls:'transcript-wrap', cn:['{%this.renderContainer(out,values)%}']}
	]),

	items:[],

//	items:[
//		{
//			xtype:'video-transcript',
//			flex:1,
//			layout:{
//				type:'vbox',
//				align: 'stretch'
//			}
//		}
//	],

	initComponent: function(){
		this.buildPresentationTimeLine(this.slideStore, this.transcriptStore);

		this.callParent(arguments);
//		this.transcriptView = this.items.getAt(0);
		this.on('transcript-ready', this.setupNoteOverlay, this);
	},


	buildPresentationTimeLine: function(slideStore, transcriptStore){
		var me = this, items = [];

		slideStore.each(function(slide){
			var m = slide.get('media'),
				vid = m && m.getAssociatedVideoId(),
				t = transcriptStore.findRecord('associatedVideoId', vid, 0, false, true, true);

			items.push({
				xtype:'video-transcript',
				flex:1,
				data: t,
				layout:{
					type:'vbox',
					align: 'stretch'
				}
			});

			items.push({
				xtype:'slide-component',
				slide: slide,
				layout:{
					type:'vbox',
					align: 'stretch'
				}
			});
		});

		this.items = items;
	},


	getTranscriptForVideo: function(id, transcriptStore){
		var s = transcriptStore.find('associatedVideoId', id);
	},


	setupNoteOverlay: function(){
		if(!this.rendered){
			console.warn('the transcript was ready before, the view rendered.');
			return;
		}

		//this.noteOverlay = Ext.widget('transcript-note-overlay', {reader: this.transcriptView, readerHeight: this.transcriptView.getHeight()});
		this.fireEvent('reader-view-ready');
	},


	syncWithVideo: function(videoState){

//		this.transcriptView.syncTranscriptWithVideo(videoState);
	}

});