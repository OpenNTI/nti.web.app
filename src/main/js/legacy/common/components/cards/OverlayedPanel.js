const Ext = require('@nti/extjs');

const DomUtils = require('legacy/util/Dom');

require('legacy/app/contentviewer/overlay/Panel');
require('./Card');

module.exports = exports = Ext.define(
	'NextThought.common.components.cards.OverlayedPanel',
	{
		extend: 'NextThought.app.contentviewer.overlay.Panel',
		alias: 'widget.overlay-card',
		representsUserDataContainer: true,
		ui: 'content-card',
		cls: 'content-card-container',

		statics: {
			getData: function (dom, reader) {
				var el = Ext.get(dom),
					data = DomUtils.parseDomObject(dom),
					description = el.down('span.description'),
					thumbnail = el.down('img');

				//the data-href has the adjusted href.
				data.href = data['attribute-data-href'];
				//If we have an icon use that as the base for the thumbnail
				data.thumbnail = data.icon;

				Ext.applyIf(data, {
					ntiid: reader && reader.getLocation().NTIID,
					basePath: reader && reader.basePath,
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

			Ext.apply(config, {
				layout: 'fit',
				items: [
					{
						xtype: 'content-card',
						reader: config.reader,
						data: this.self.getData(
							config.contentElement,
							config.reader
						),
					},
				],
			});

			this.callParent([config]);
		},

		findLine: function () {
			var doc = this.contentElement.ownerDocument,
				range = doc.createRange();

			range.selectNodeContents(this.contentElement);
			return { range: range, rect: this.el.dom.getBoundingClientRect() };
		},
	}
);
