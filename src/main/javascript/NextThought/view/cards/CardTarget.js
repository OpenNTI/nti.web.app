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
			margin: '45px 0 0 0'
		});
	},


	syncTop: function(){
		if(!this.contentElement){return;}
		var ctTop = this.el.up('.x-reader-pane').getY(),
			top = (10 + ctTop);
		this.el.setY(top);
	},

	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		var data = DomUtils.parseDomObject(config.contentElement);

		//the data-href has the adjusted href.
		data.href = data['attribute-data-href'];

		this.viewportMonitor = Ext.Function.createBuffered(this.viewportMonitor,100,this,null);

		config.layout = 'fit';

		this.callParent([config]);
		this.reader.lockScroll();
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);

		this.iframe = this.add({
			xtype: 'box',
			autoEl: {
				tag: 'iframe',
				src: data.href,
				border:0,
				frameborder:0
                //scrolling: 'no',
				//allowTransparency:true,
				//seamless:true
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

		range.selectNodeContents(this.contentElement);
		return {range: range, rect: {top: 121}};
	}
});
