export default Ext.define('NextThought.common.components.cards.CardTarget', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.overlay-card-target',

	requires: [
		'NextThought.util.Dom'
	],

	representsUserDataContainer: true,
	ui: 'content-card',
	cls: 'content-card-target-container',


	setupContentElement: function() {
		this.callParent(arguments);
		Ext.fly(this.contentElement).setStyle({
			margin: '45px 0 0 0'
		});
	},


	syncTop: function() {
		if (!this.contentElement) {return;}
		var ctTop = this.el.up('.x-reader-pane').getY(),
			top = (10 + ctTop);
		this.el.setY(top);
		this.viewportMonitor();

		return top;
	},

	constructor: function(config) {
		if (!config || !config.contentElement) {
			throw 'you must supply a contentElement';
		}

		var version, data = DomUtils.parseDomObject(config.contentElement),
			nativeSupport = Globals.hasPDFSupport(),
			anchorAttr = 'class=\'link\' target=\'_blank\'',
			chrome = '<a ' + anchorAttr + ' href=\'http://www.google.com/chrome\'>Chrome,</a>',
			safari = '<a ' + anchorAttr + ' href=\'http://www.apple.com/safari/download/\'>Safari,</a>',
			ff = '<a ' + anchorAttr + ' href=\'http://www.getfirefox.com\'>Firefox,</a>',
			ie = '<a ' + anchorAttr + ' href=\'http://www.microsoft.com/ie\'>Internet Explorer.</a>';

		//the data-href has the adjusted href.
		data.href = data['attribute-data-href'];

		this.viewportMonitor = Ext.Function.createBuffered(this.viewportMonitor, 100, this, null);

		config.layout = 'fit';

		this.callParent([config]);
		this.reader.getScroll().lock();
		Ext.EventManager.onWindowResize(this.viewportMonitor, this);

		if (Ext.isGecko) {
			version = /Firefox\/(\d+\.\d+)/.exec(navigator.userAgent)[1];
			version = parseInt(version, 10);
		}

		//Not supported in mobile. Telling them to update to latest version would be confusing.
		if (Ext.is.iOS) {
			this.add({
				xtype: 'box',
				renderTpl: Ext.DomHelper.markup({
					cls: 'no-support', 'data-link': data.href, cn: [
						{ cls: 'message', html: '{{{NextThought.view.cards.CardTarget.no-mobile-support}}}'}
					]
				})
			});
			return;
		}

		if ((version && version <= 18) || (!nativeSupport && !Ext.isGecko)) {
			this.addUnsupported(data);
			return;
		}

		this.addIframe(data);

		this.mon(this.reader, 'allow-custom-scrolling', function() {
			return false;
		}, this);
	},


	resolveHref: function(data) {
		return Promise.resolve(data.href);
	},


	resolveTargetMimeType: function(data) {
		return Promise.resolve(data.targetMimeType);
	},


	addIframe: function(data) {
		var me = this;

		return Promise.all([
				this.resolveHref(data),
				this.resolveTargetMimeType(data)
			]).then(function(results) {
				me.addIframeFromHref(results[0], results[1]);
			});
	},


	addIframeFromHref: function(href, targetMimeType) {
		this.add({
			xtype: 'box',
			autoEl: {
				tag: Ext.isIE10m ? 'object' : 'iframe',
				src: href,
				data: href,
				type: targetMimeType || 'application/pdf',
				border: 0,
				frameBorder: 0
			}
		});
	},


	addUnsupported: function(data) {
		return this.resolveHref(data)
			.then(this.addUnsupportedForHref.bind(this));
	},


	addUnsupportedForHref: function(href) {
		var chrome = '<a ' + anchorAttr + ' href=\'http://www.google.com/chrome\'>Chrome,</a>',
			safari = '<a ' + anchorAttr + ' href=\'http://www.apple.com/safari/download/\'>Safari,</a>',
			ff = '<a ' + anchorAttr + ' href=\'http://www.getfirefox.com\'>Firefox,</a>',
			ie = '<a ' + anchorAttr + ' href=\'http://www.microsoft.com/ie\'>Internet Explorer.</a>';


		this.add({
			xtype: 'box',
			renderTpl: Ext.DomHelper.markup({
				cls: 'no-support', cn: [
					{cls: 'message', html: 'Your browser does not currently support viewing PDF files.'},
					{cls: '', cn: [
						{tag: 'a', cls: 'link', href: 'https://get.adobe.com/reader/', target: '_blank', html: 'Install Adobe Acrobat Reader '},
						'or try the latest version of one of the following browsers:<br>',
						chrome,
						' ',
						safari,
						' ',
						ff,
						' ',
						ie
					]},
					'<br>',
					{cls: '', cn: [
						{tag: 'a', cls: 'link', href: href, html: 'Download the PDF'}
					]}
				]
			})
		});
	},


	onDestroy: function() {
		this.reader.getScroll().unlock();
		Ext.EventManager.removeResizeListener(this.viewportMonitor, this);
		this.callParent(arguments);
	},


	viewportMonitor: function() {
		try {

			var margin = 15,
				y = this.getY(),
				h = (Ext.dom.Element.getViewportHeight() - y) - margin;

			if (this.getHeight() !== h) {
				this.setHeight(h);
			}
		}
		catch (e) {
			console.warn(e.message);
		}
	},


	afterRender: function() {
		this.callParent(arguments);
		this.viewportMonitor();
		//	this.mon(Ext.get(Ext.DomHelper.append(this.el,{cls:'back-button'})),{
		//		click: function(){
		//			history.back();
		//		}
		//	});
	},


	findLine: function() {
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNodeContents(this.contentElement);
		return {range: range, rect: {top: 267}};
	}
});
