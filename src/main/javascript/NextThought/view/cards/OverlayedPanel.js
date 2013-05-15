Ext.define('NextThought.view.cards.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-card',

	requires:[
		'NextThought.util.Dom',
		'NextThought.view.cards.Card'
	],

	representsUserDataContainer:true,
	ui: 'content-card',
	cls: 'content-card-container',

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

		//the data-href has the adjusted href.
		data.href = data['attribute-data-href'];

		Ext.applyIf(data,{
			basePath: reader && reader.basePath,
			description: (description && description.getHTML()) || '',
			thumbnail: (thumbnail && thumbnail.getAttribute('src')) || ''
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
	},


	findLine: function(){
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNodeContents(this.contentElement);
		return {range: range, rect: this.el.dom.getBoundingClientRect()};
	}
});
