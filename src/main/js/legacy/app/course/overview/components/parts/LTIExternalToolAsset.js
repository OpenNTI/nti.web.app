const Ext = require('@nti/extjs');
const ContentviewerActions = require('internal/legacy/app/contentviewer/Actions');
const WindowsActions = require('internal/legacy/app/windows/Actions');
const WindowsStateStore = require('internal/legacy/app/windows/StateStore');
const Globals = require('internal/legacy/util/Globals');

require('internal/legacy/model/LTIExternalToolAsset');
require('internal/legacy/common/components/cards/Card');

function resolveIcon(config, n, root) {
	const icon = n.getAttribute('icon');
	let getIcon;

	if (config.record && config.record.resolveIcon) {
		getIcon = config.record.resolveIcon(root);
	} else if (Globals.ROOT_URL_PATTERN.test(icon)) {
		getIcon = Promise.resolve({ url: Globals.getURL(icon) });
	} else {
		getIcon = Promise.resolve({ url: Globals.getURL((root || '') + icon) });
	}

	return getIcon;
}

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.parts.LTIExternalToolAsset',
	{
		extend: 'NextThought.common.components.cards.Card',

		alias: ['widget.course-overview-ltiexternaltoolasset'],

		doNotRenderIcon: true,

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'thumbnail',
				cn: [
					{
						cls: 'icon {extension} {iconCls}',
						style: "background-image: url('{thumbnail}');",
						cn: [
							{
								tag: 'label',
								cls: 'extension',
								html: '{extension}',
							},
						],
					},
				],
			},
			{
				cls: 'meta',
				cn: [
					{ cls: 'title', html: '{title:htmlEncode}' },
					{
						cls: 'byline',
						html: '{{{NextThought.view.cards.Card.by}}}',
					},
					{ cls: 'description', html: '{description:htmlEncode}' },
				],
			},
		]),

		renderSelectors: {
			iconEl: '.thumbnail .icon',
			extensionEl: '.thumbnail .icon .extension',
			meta: '.meta',
			titleEl: '.meta .title',
			thumbnailEl: '.thumbnail',
		},
		constructor: function (config) {
			var n = config.node || {
					getAttribute: function (a) {
						return config[a];
					},
				},
				i = config.locationInfo || {
					root:
						config.course &&
						config.course.getContentRoots() &&
						config.course.getContentRoots()[0],
				},
				root = i && i.root,
				record = n.getAttribute('record'),
				link = record.getLink('Launch'),
				ntiid = n.getAttribute('ntiid'),
				href = Globals.getURL(link);

			resolveIcon(config, n, root).then((icon = {}) => {
				this.data.thumbnail = icon.url;
				this.data.extension = icon.extension;
				this.data.iconCls = icon.iconCls;

				if (this.iconEl) {
					this.iconEl.addCls([
						icon.extension || '',
						icon.iconCls || '',
					]);
					this.iconEl.setStyle({
						backgroundImage: `url('${icon.url}')`,
					});
				}

				if (this.extensionEl && icon.extension) {
					this.extensionEl.update(icon.extension);
				}
			});

			config.data = {
				description: n.getAttribute('description'),
				ntiid: ntiid,
				title: n.getAttribute('title'),
				'attribute-data-href': href,
				href: href,
			};

			this.ContentActions = ContentviewerActions.create();

			this.callParent([config]);

			this.WindowActions = WindowsActions.create();
			this.WindowStore = WindowsStateStore.getInstance();
		},
	}
);
