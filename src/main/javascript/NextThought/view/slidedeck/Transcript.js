Ext.define('NextThought.view.slidedeck.Transcript', {
	extend: 'NextThought.view.content.Base', //'Ext.container.Container',
	alias: 'widget.slidedeck-transcript',
	requires:[
		'NextThought.layout.component.Natural',
		'NextThought.view.video.transcript.Transcript',
		'NextThought.view.content.reader.NoteOverlay',
		'NextThought.view.slidedeck.transcript.NoteOverlay'
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

	items:[
		{
			xtype:'video-transcript',
			flex:1,
			layout:{
				type:'vbox',
				align: 'stretch'
			}
		}
	],

	initComponent: function(){
		var t = this.items[0];
		t.data = this.data;
		//Cleanup, since we're just passing the transcript data.
		delete this.data;

		this.callParent(arguments);
		this.transcriptView = this.items.getAt(0);
		this.on('transcript-ready', this.setupNoteOverlay, this);
	},


	setupNoteOverlay: function(){
		if(!this.rendered){
			console.warn('the transcript was ready before, the view rendered.');
			return;
		}

		this.noteOverlay = Ext.widget('transcript-note-overlay', {reader: this.transcriptView, readerHeight: this.transcriptView.getHeight()});
		this.fireEvent('reader-view-ready');
	},


	syncWithVideo: function(videoState){
		this.transcriptView.syncTranscriptWithVideo(videoState);
	}

});