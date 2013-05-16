Ext.define('NextThought.view.cards.CardTarget',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-card-target',

	requires:[
		'NextThought.util.Dom'
	],

	representsUserDataContainer:true,
	ui: 'content-card',
	cls: 'content-card-target-container',


	setupContentElement: function(){
		this.callParent(arguments);
		Ext.fly(this.contentElement).setStyle({
			margin: '15px 0'
		});
	},


	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		var data = DomUtils.parseDomObject(config.contentElement);

		//the data-href has the adjusted href.
		data.href = data['attribute-data-href'];

		this.viewportMonitor = Ext.Function.createBuffered(this.viewportMonitor,100,this,null);

		this.callParent([config]);
		this.reader.lockScroll();
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);

		this.iframe = this.add({
			floating: true,
			renderTo: Ext.getBody(),
			xtype: 'box',
			cls: 'content-card-target',

			autoEl: {
				tag: 'iframe',
				src: data.href,
				border:0,
				frameborder:0,
                scrolling: 'no',
				allowTransparency:true,
				seamless:true
			}
		});
	},


	onDestroy: function(){
		this.reader.unlockScroll();
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
		this.callParent(arguments);
	},


	viewportMonitor: function(){
		try {

			var margin = 15,
				frame = this.iframe,
				y = this.getY(),
				h = (Ext.dom.Element.getViewportHeight() - y) - margin;

			this.setHeight(h);

			frame.alignTo(this.el,'tl-tl');
			frame.setSize(this.getWidth(),h);
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
