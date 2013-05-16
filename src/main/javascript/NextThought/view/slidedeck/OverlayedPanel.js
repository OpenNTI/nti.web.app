Ext.define('NextThought.view.slidedeck.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-slidedeck',

	requires:[
		'NextThought.util.Dom',
		'NextThought.view.slidedeck.SlideDeck'
	],

	ui: 'content-slidedeck',
	cls: 'content-slidedeck-container',

	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		var dom = config.contentElement,
			el = Ext.get(dom),
			reader = config.reader,
			data = DomUtils.parseDomObject(dom),
			description = el.down('span.description'),
			thumbnail = el.down('img');

		Ext.applyIf(data,{
			basePath: reader && reader.basePath,
			description: (description && description.getHTML()) || '',
			thumbnail: (thumbnail && thumbnail.getAttribute('src')) || ''
		});

		Ext.apply(config,{
			layout:'fit',
			items:[{
				xtype: 'content-slidedeck',
				data: data,
				contentElement: dom
			}]
		});

		this.callParent([config]);
		this.setupContentElement();
	},


	findLine: function(){
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNode(this.contentElement);
		return {range: range, rect: this.el.dom.getBoundingClientRect()};
	}
});

