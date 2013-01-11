Ext.define('NextThought.view.video.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-video-roll',

	requires:[
		'NextThought.util.Dom',
		'NextThought.view.video.Roll'
	],

	ui: 'video-roll',
	cls: 'video-roll',

	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		config = Ext.applyIf(config, {
			layout : 'fit'
		});

		config.items = [{
			xtype: 'video-roll',
			data: DomUtils.getVideosFromDom(config.contentElement)
		}];

		this.callParent([config]);
		this.setupContentElement();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.down('video-roll').selectFirst();
	}
});
