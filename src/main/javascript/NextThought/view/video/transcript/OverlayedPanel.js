Ext.define('NextThought.view.video.transcript.OverlayedPanel', {
	extend: 'NextThought.view.content.overlay.Panel',
	alias:['widget.video-transcript-overlay'],
	requires:[
		'NextThought.util.Dom',
		'NextThought.view.video.transcript.Transcript'
	],

	ui: 'content-slidevideo',
	cls: 'content-slidevideo-container',

	constructor: function(config){

		Ext.apply(config, {
			layout:'fit',
			items:[{
				xtype: 'video-transcript',
//				data: this.self.getData(config.contentElement,config.reader),
				contentElement: config.contentElement,
				textContent: config.textContent
			}]
		});

		return this.callParent(arguments);
	}



});
