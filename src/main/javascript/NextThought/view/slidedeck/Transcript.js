Ext.define('NextThought.view.slidedeck.Transcript', {
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-transcript',
	requires:[
		'NextThought.layout.component.Natural',
		'NextThought.view.video.transcript.Transcript'
	],

	ui:'transcript',
	cls:'transcript-view',

	layout: 'auto',
	componentLayout: 'natural',
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
	},


	getTranscriptView: function(){
		return this.items.getAt(0);
	},


	syncWithVideo: function(videoState){
		var t = this.getTranscriptView();
		t.syncTranscriptWithVideo(videoState);
	}

});