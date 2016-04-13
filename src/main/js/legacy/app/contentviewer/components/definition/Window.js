var Ext = require('extjs');
var WindowWindow = require('../../../../common/window/Window');
var {getURL, swallow} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.contentviewer.components.definition.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.dictionary-window',

	cls: 'dictionary-window',
	title: 'Dictionary',
	closeAction: 'destroy',
	width: 310,
	height: 245,
	layout: 'fit',
	autoRender: true,
	hidden: true,
	modal: true,
	items: {
		xtype: 'component',
		cls: 'definition',
		autoEl: {
			tag: 'iframe',
			src: Ext.SSL_SECURE_URL,
			frameBorder: 0,
			marginWidth: 0,
			height: 210,
			marginHeight: 0,
			seamless: true,
			transparent: true,
			allowTransparency: true,
			style: {
				overflowX: 'hidden',
				overflowY: 'scroll'
			}
		}
	},

	fallbackURL: '/dictionary/',
	xslUrl: '/app/resources/xsl/dictionary.xsl',

	initComponent: function () {
		var me = this, p, nib = 20, top, y, x;

		me.pageInfo = me.pageInfo || me.reader.getLocation().pageInfo;

		if (!me.pageInfo || !Ext.isFunction(me.pageInfo.getLink)) {
			Ext.Error.raise('Need a PageInfo');
		}

		if (!me.term) {
			Ext.Error.raise('definition term required');
		}

		//figure out xy
		p = this.pointTo;
		if (p) {
			top = Ext.Element.getViewportHeight() < (p.bottom + this.getHeight() + nib);
			y = Math.round(top ? p.top - nib - this.getHeight() : p.bottom + nib);
			x = Math.round((p.left + (p.width / 2)) - (this.getWidth() / 2));

			Ext.apply(me, {x: x, y: y});
			me.addCls(top ? 'south' : 'north');
		}

		me.callParent(arguments);
		me.on({
			scope: me,
			close: function () { me.dragMaskOff(); },
			show: me.fixMask,
			destroy: me.unfixMask,
			afterrender: Ext.bind(me.loadDefinition, me, [me.term])
		});

		//me.mon(history.observable, 'pop', 'close', me);
	},

	syncHeight: Ext.emptyFn,//not needed here.

	fixMask: function () {
		var m = this.maskEl = this.zIndexManager.mask;
		m.addCls('nti-clear');
	},

	unfixMask: function () {
		try { this.maskEl.removeCls('nti-clear'); }
		catch (e) {swallow(e);}
	},


	fillIn: function (content) {
		var me = this,
			doc = this.getDocumentElement().open();

		doc.write(content);
		doc.close();
		doc.onclick = function (e) {
			e = Ext.EventObject.setEvent(e || event);
			e.stopEvent();
			var t = e.getTarget('a[href]', null, true);

			if (t) {
				me.loadDefinition(decodeURIComponent(t.getAttribute('href')));
			}

			return false;
		};
		me.showAt(me.x, me.y);
	},


	loadDefinition: function (term) {
		var me = this;
		me.term = term;


		me.getXSLTProcessor()
				.then(function (processor) {
					return me.queryDefinition()
							.then(function (text) {
								return Promise.resolve()
										.then(me._hasStandardParts)
										.then(me._parse.bind(me, processor, text), me._ieParse.bind(me, processor, text));
							})
							.then(function (o) {
								if (o.indexOf('&lt;/a&gt;') >= 0) {
									o = Ext.String.htmlDecode(o);
								}
								return o;
							});
				})
				.then(function (o) {
					me.fillIn(o);
				})
				.catch(function (e) {
					me.destroy();
					alert(getString('NextThought.view.definition.Window.error'));
					Error.raiseForReport(e);
				});
	},


	getDocumentElement: function () {
		var iframe = this.down('[cls=definition]').el.dom;
		return iframe.contentDocument || (iframe.contentWindow || window.frames[iframe.name]).document;
	},


	queryDefinition: function () {
		var u = this.pageInfo.getLink('Glossary');
		if (!u) {
			console.warn('PageInfo ', this.pageInfo.raw, 'did not contain a glocery rel link');
			u = this.fallbackURL;
		}

		if (u.split(/\//g).last() !== '') {
			u += '/';
		}

		return Service.request(getURL(u + encodeURIComponent(this.term)));
	},


	_parse: function (processor, text) {
		var domtree, outputtree;
		domtree = new DOMParser().parseFromString(text, 'text/xml');
		outputtree = processor.transformToDocument(domtree);
		return new XMLSerializer().serializeToString(outputtree);
	},


	_ieParse: function (processor, text) {
		var domtree = new ActiveXObject('Msxml2.DOMDocument');
		domtree.loadXML(text);
		processor.input = domtree;
		processor.transform();
		return processor.output;
	},


	_buildProcessor: function (text) {
		var dom = new DOMParser().parseFromString(text, 'text/xml'),
			p = new XSLTProcessor();

		p.importStylesheet(dom);
		return p;
	},


	_ieBuildProcessor: function (text) {
		try {
			var xsldoc = new ActiveXObject('Msxml2.FreeThreadedDOMDocument'),
				xslt = new ActiveXObject('Msxml2.XSLTemplate');
			xsldoc.loadXML(text);
			xslt.stylesheet = xsldoc;
			return xslt.createProcessor();
		} catch (e) {
			throw 'Dictionary may not be installed, or not configured properly.' + (e.stack || e.message || e);
		}
	},


	_hasStandardParts: function () {
		if (!window.XSLTProcessor || !window.XMLSerializer || !window.DOMParser) {
			throw 'do IE path';
		}
	},


	getXSLTProcessor: function () {
		var me = this;
		if (me.self.xsltProcessor) {
			return Promise.resolve(me.self.xsltProcessor);
		}

		return Service.request(me.xslUrl)
				.then(function (text) {
					return Promise.resolve()
							.then(me._hasStandardParts)
							.then(function () {
								return me._buildProcessor(text);
							//IE doesn't have DOMParser AND XSLTProcessor as top level objects.
							}, function () {
								return me._ieBuildProcessor(text);
							});
				})
				.then(function (p) {
					me.self.xsltProcessor = p;
					return p;
				});
	}
});
