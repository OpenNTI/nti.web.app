Ext.define('NextThought.view.links.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-link',

	requires:[
		'NextThought.util.Dom',
		'NextThought.view.links.Link'
	],

	ui: 'object-link',
	cls: 'object-link-container',

	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		Ext.apply(config,{
			layout:'fit',
			items:[{
				xtype: 'external-link',
				data: DomUtils.parseDomObject(config.contentElement)
			}]
		});

		this.callParent([config]);
		this.setupContentElement();
	}
});
