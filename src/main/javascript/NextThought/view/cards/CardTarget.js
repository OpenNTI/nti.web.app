Ext.define('NextThought.view.cards.CardTarget',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-card-target',

	requires:[
		'NextThought.util.Dom'
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
				xtype: 'box',
				autoEl: {
					tag: 'iframe',
					src: data.href,
					border:0,
					frameborder:0,
                    scrolling: 'no',
					allowTransparency:true,
					seamless:true
				}
			}]
		});

		this.viewportMonitor = Ext.Function.createBuffered(this.viewportMonitor,100,this,null);

		this.callParent([config]);
		this.reader.lockScroll();
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);
	},


	onDestroy: function(){
		this.reader.unlockScroll();
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
		this.callParent(arguments);
	},


	viewportMonitor: function(){
		try {

			var margin = 15,
				y = this.getY(),
				h = (Ext.dom.Element.getViewportHeight() - y) - margin;

			this.setHeight(h);
		}
		catch( e ) {
			console.warn(e.message);
		}
	},


	afterRender: function(){
		this.callParent(arguments);
		this.viewportMonitor();
	},


	findLine: function(){
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNode(this.contentElement);
		return {range: range, rect: this.el.dom.getBoundingClientRect()};
	}
});
