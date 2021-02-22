const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.timeline.items.Item',
	{
		extend: 'Ext.Component',
		alias: 'widget.overview-editing-timeline-items-item',

		cls: 'overview-editing-listitem',

		renderTpl: Ext.DomHelper.markup({
			cls: 'overview-timeline',
			cn: [
				{
					cls: 'timeline-item',
					cn: [
						{
							cls: 'thumbnail',
							style: { backgroundImage: 'url({thumbnail})' },
						},
						{
							cls: 'meta',
							cn: [
								{ cls: 'title', html: '{title}' },
								{ cls: 'description', html: '{description}' },
							],
						},
					],
				},
			],
		}),

		beforeRender: function () {
			this.callParent(arguments);

			var item = this.record;
			this.renderData = Ext.apply(this.renderData || {}, {
				thumbnail: this.getThumbnailURL(item),
				title: item && item.get('label'),
				description: item && item.get('description'),
			});
		},

		getThumbnailURL: function (item) {
			var iconURL = item && item.get('icon');
			if (iconURL) {
				if (Globals.ROOT_URL_PATTERN.test(iconURL)) {
					return Globals.getURL(iconURL);
				}

				iconURL = (this.basePath || '') + iconURL;
				return Globals.getURL(iconURL);
			}

			return '';
		},
	}
);
