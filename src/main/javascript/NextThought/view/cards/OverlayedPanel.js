Ext.define('NextThought.view.cards.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-card',

	requires:[
		'NextThought.util.Dom',
		'NextThought.view.cards.Card'
	],

	ui: 'content-card',
	cls: 'content-card-container',

	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		var dom = config.contentElement,
			el = Ext.get(dom),
			data = DomUtils.parseDomObject(dom),
			description = el.down('span.description'),
			thumbnail = el.down('img');

		Ext.applyIf(data,{
			description: (description && description.getHTML()) || '',
			thumbnail: (thumbnail && thumbnail.src) || ''
		});

		Ext.apply(config,{
			layout:'fit',
			items:[{
				xtype: 'content-card',
				data: data
			}]
		});

		this.callParent([config]);
		this.setupContentElement();
	}
});
