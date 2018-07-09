const Ext = require('@nti/extjs');

const DomUtils = require('legacy/util/Dom');
const Globals = require('legacy/util/Globals');

require('legacy/app/contentviewer/overlay/Panel');

module.exports = exports = Ext.define(
	'NextThought.common.components.cards.CardIframe',
	{
		extend: 'NextThought.app.contentviewer.overlay.Panel',
		alias: 'widget.overlay-card-iframe',
		representsUserDataContainer: true,
		ui: 'content-card',
		cls: 'content-card-target-container',

		constructor (config) {
			const data = DomUtils.parseDomObject(config.contentElement);

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

			this.addIframe(data);

			this.mon(
				this.reader,
				'allow-custom-scrolling',
				() => {
					return false;
				},
				this
			);
		},

		afterRender () {
			this.callParent(arguments);
			this.viewportMonitor();
		},

		onDestroy () {
			this.reader.getScroll().unlock();
			Ext.EventManager.removeResizeListener(this.viewportMonitor, this);
			this.callParent(arguments);
		},

		addIframe (data) {
			const { href } = data;
			this.add({
				xtype: 'box',
				autoEl: {
					tag: 'iframe',
					src: href,
					data: href,
					border: 0,
					frameBorder: 0
				}
			});
		},

		findLine () {
			const doc = this.contentElement.ownerDocument;
			const range = doc.createRange();

			range.selectNodeContents(this.contentElement);
			return { range: range, rect: { top: 267 } };
		},

		setupContentElement () {
			this.callParent(arguments);
			Ext.fly(this.contentElement).setStyle({
				margin: '45px 0 0 0'
			});
		},

		syncTop () {
			if (!this.contentElement) {
				return;
			}
			const ctTop = this.el.up('.x-reader-pane').getY();
			const top = 10 + ctTop;

			this.el.setY(top);
			this.viewportMonitor();

			return top;
		},

		viewportMonitor () {
			try {
				const margin = 15;
				const y = this.getY();
				const h = Ext.dom.Element.getViewportHeight() - y - margin;

				if (this.getHeight() !== h) {
					this.setHeight(h);
				}
			} catch (e) {
				console.warn(e.message);
			}
		}
	}
);
