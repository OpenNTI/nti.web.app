Ext.define('NextThought.view.image.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-image-roll',

	requires:[
		'NextThought.util.Dom',
		'NextThought.view.image.Roll'
	],

	ui: 'image-roll',
	cls: 'image-roll',

	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		config = Ext.applyIf(config, {
			layout : 'fit'
		});

		config.items = [{
			xtype: 'image-roll',
			data: DomUtils.getImagesFromDom(config.contentElement)
		}];

		this.callParent([config]);
		this.setupContentElement();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.down('image-roll').selectFirst();
	}
});
