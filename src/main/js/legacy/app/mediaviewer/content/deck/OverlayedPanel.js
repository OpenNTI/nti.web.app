const Ext = require('@nti/extjs');
const DomUtils = require('internal/legacy/util/Dom');

require('internal/legacy/app/contentviewer/overlay/Panel');
require('../Slidedeck');

module.exports = exports = Ext.define(
	'NextThought.app.mediaviewer.content.deck.OverlayedPanel',
	{
		extend: 'NextThought.app.contentviewer.overlay.Panel',
		alias: 'widget.overlay-slidedeck',
		ui: 'content-launcher',
		cls: 'content-launcher-container',

		statics: {
			getData: function (dom, reader) {
				var el = Ext.get(dom),
					data = DomUtils.parseDomObject(dom),
					description = el.down('span.description'),
					thumbnail = el.down('img');

				Ext.applyIf(data, {
					description: (description && description.getHTML()) || '',
					thumbnail:
						(thumbnail && thumbnail.getAttribute('src')) || '',
				});
				return data;
			},
		},

		constructor: function (config) {
			if (!config || !config.contentElement) {
				throw new Error('you must supply a contentElement');
			}

			var dom = config.contentElement,
				el = Ext.get(dom),
				reader = config.reader,
				data = DomUtils.parseDomObject(dom),
				description = el.down('span.description'),
				thumbnail = el.down('img');

			Ext.applyIf(data, {
				basePath: reader && reader.basePath,
				description: (description && description.getHTML()) || '',
				thumbnail: (thumbnail && thumbnail.getAttribute('src')) || '',
			});

			Ext.apply(config, {
				layout: 'fit',
				items: [
					{
						xtype: 'content-slidedeck',
						data: data,
						contentElement: dom,
						reader: reader,
					},
				],
			});

			this.callParent([config]);
		},

		findLine: function () {
			var doc = this.contentElement.ownerDocument,
				range = doc.createRange();

			range.selectNode(this.contentElement);
			return { range: range, rect: this.el.dom.getBoundingClientRect() };
		},
	}
);
