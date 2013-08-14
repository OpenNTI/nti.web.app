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

		var version, data = DomUtils.parseDomObject(config.contentElement),
			nativeSupport = Ext.Array.contains(Ext.Array.pluck(navigator.mimeTypes,'type'), 'application/pdf'),
			anchorAttr = 'class=\'link\' target=\'_blank\'',
			chrome = '<a '+anchorAttr+' href=\'http://www.google.com/chrome\'>Chrome</a>',
			safari = '<a '+anchorAttr+' href=\'http://www.apple.com/safari/download/\'>Safari 5.0+</a>',
			ff = '<a '+anchorAttr+' href=\'http://www.getfirefox.com\'>Firefox 5.0+</a>',
			ie = '<a '+anchorAttr+' href=\'http://www.microsoft.com/ie\'>Internet Explorer 9+</a>';

		//the data-href has the adjusted href.
		data.href = data['attribute-data-href'];

		this.viewportMonitor = Ext.Function.createBuffered(this.viewportMonitor,100,this,null);

		config.layout = 'fit';

		this.callParent([config]);
		this.reader.getScroll().lock();
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);

		if(Ext.isGecko){
			version = /Firefox\/(\d+\.\d+)/.exec(navigator.userAgent)[1];
			version = parseInt(version, 10);
		}
		//If we are in IE have them open it in another window
		if(Ext.isIE10m){
			this.add({
				xtype:'box',
				autoEl: {
					tag: 'a',
					href: data.href,
					target: '_blank',
					cls: 'no-support',
					cn: [
						{ cls: 'message', html: 'Your browser does not support viewing this content with this application.' },
						{ cn:[
							{
								tag: 'span', cls: 'link',
								html: 'Click Here'
							},
							' to open it in another window'
						]}
					]
				}
			});
			return;
		}
		//if we are in FF < v.19 or we don't detect a native support ask them to update
		//after FF 19 there is a native viewer that is on by default
		if( (version && version <= 18) || (!nativeSupport && !Ext.isGecko)){
			this.add({
				xtype: 'box',
				renderTpl: Ext.DomHelper.markup({
					cls: 'no-support', 'data-link': data.href, cn: [
						{ cls: 'message', html: 'Your browser does not support viewing this content with this application.'},
						{ cn: [
							{ html: 'Please try again with the latest version of '+chrome+', '+safari+', '+ff+', or '+ie+'.'}
						]}
					]
				})
			});
			return;
		}
		//If we are FF 19+ or we detect a native viewer show it
		this.add({
			xtype: 'box',
			autoEl: {
				tag: Ext.isIE10m ? 'object' : 'iframe',
				src: data.href,
				data: data.href,
				type: 'application/pdf',//TODO: figure out mimeType
				border:0,
				frameborder:0
                //scrolling: 'no',
				//allowTransparency:true,
				//seamless:true
			}
		});
	},


	onDestroy: function(){
		this.reader.getScroll().unlock();
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
		this.mon(Ext.get(Ext.DomHelper.append(this.el,{cls:'back-button'})),{
			click: function(){
				history.back();
			}
		});
	},


	findLine: function(){
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNodeContents(this.contentElement);
		return {range: range, rect: {top: 267}};
	}
});
