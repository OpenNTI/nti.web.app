const Ext = require('@nti/extjs');
const DomUtils = require('internal/legacy/util/Dom');

require('internal/legacy/app/contentviewer/overlay/Panel');

module.exports = exports = Ext.define(
	'NextThought.common.components.cards.CardTarget',
	{
		extend: 'NextThought.app.contentviewer.overlay.Panel',
		alias: 'widget.overlay-card-target',
		representsUserDataContainer: true,
		ui: 'content-card',
		cls: 'content-card-target-container',

		setupContentElement: function () {
			this.callParent(arguments);
			Ext.fly(this.contentElement).setStyle({
				margin: '45px 0 0 0',
			});
		},

		syncTop: function () {
			if (!this.contentElement) {
				return;
			}
			var ctTop = this.el.up('.x-reader-pane').getY(),
				top = 10 + ctTop;

			if (top !== this.cachedTop) {
				this.cachedTop = top;
				this.el.setY(top);
				this.viewportMonitor();
			}

			return top;
		},

		constructor: function (config) {
			if (!config || !config.contentElement) {
				throw new Error('you must supply a contentElement');
			}

			let data = DomUtils.parseDomObject(config.contentElement);

			// let anchorAttr = 'class=\'link\' target=\'_blank\'';
			// let chrome = '<a ' + anchorAttr + ' href=\'http://www.google.com/chrome\'>Chrome,</a>';
			// let safari = '<a ' + anchorAttr + ' href=\'http://www.apple.com/safari/download/\'>Safari,</a>';
			// let ff = '<a ' + anchorAttr + ' href=\'http://www.getfirefox.com\'>Firefox,</a>';
			// let ie = '<a ' + anchorAttr + ' href=\'http://www.microsoft.com/ie\'>Internet Explorer.</a>';

			//the data-href has the adjusted href.
			data.href = data['attribute-data-href'];

			this.viewportMonitor = Ext.Function.createBuffered(
				this.viewportMonitor,
				100,
				this,
				null
			);

			config.layout = 'fit';

			this.callParent([config]);
			this.reader.getScroll().lock();
			Ext.EventManager.onWindowResize(this.viewportMonitor, this);

			//Not supported in mobile. Telling them to update to latest version would be confusing.
			if (Ext.is.iOS) {
				this.add({
					xtype: 'box',
					renderTpl: Ext.DomHelper.markup({
						cls: 'no-support',
						'data-link': data.href,
						cn: [
							{
								cls: 'message',
								html:
									'{{{NextThought.view.cards.CardTarget.no-mobile-support}}}',
							},
						],
					}),
				});
				return;
			}

			this.addIframe(data);

			this.mon(
				this.reader,
				'allow-custom-scrolling',
				function () {
					return false;
				},
				this
			);
		},

		resolveHref: function (data) {
			return Promise.resolve(data.href);
		},

		resolveTargetMimeType: function (data) {
			return Promise.resolve(data.targetMimeType);
		},

		addIframe: function (data) {
			var me = this;

			return Promise.all([
				this.resolveHref(data),
				this.resolveTargetMimeType(data),
			]).then(function (results) {
				me.addIframeFromHref(results[0], results[1]);
			});
		},

		addIframeFromHref: function (href, targetMimeType) {
			this.add({
				xtype: 'box',
				autoEl: {
					tag: Ext.isIE10m ? 'object' : 'iframe',
					src: href,
					data: href,
					type: targetMimeType || 'application/pdf',
					border: 0,
					frameBorder: 0,
				},
			});
		},

		onDestroy: function () {
			this.reader.getScroll().unlock();
			Ext.EventManager.removeResizeListener(this.viewportMonitor, this);
			this.callParent(arguments);
		},

		viewportMonitor: function () {
			try {
				var margin = 15,
					y = this.cachedY,
					h = Ext.dom.Element.getViewportHeight() - y - margin;

				if (this.getHeight() !== h) {
					this.setHeight(h);
				}
			} catch (e) {
				console.warn(e.message);
			}
		},

		afterRender: function () {
			this.callParent(arguments);

			this.cachedY = this.getY();

			this.viewportMonitor();
			//	this.mon(Ext.get(Ext.DomHelper.append(this.el,{cls:'back-button'})),{
			//		click: function(){
			//			history.back();
			//		}
			//	});
		},

		findLine: function () {
			var doc = this.contentElement.ownerDocument,
				range = doc.createRange();

			range.selectNodeContents(this.contentElement);
			return { range: range, rect: { top: 267 } };
		},
	}
);
