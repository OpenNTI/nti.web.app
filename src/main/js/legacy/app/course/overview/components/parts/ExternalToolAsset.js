const Ext = require('extjs');

const Globals = require('legacy/util/Globals');

require('legacy/model/ExternalToolAsset');
require('legacy/common/components/cards/Card');

function resolveIcon (config, n, root) {
	const icon = n.getAttribute('icon');
	let getIcon;

	if (config.record && config.record.resolveIcon) {
		getIcon = config.record.resolveIcon(root, config.course);
	} else if (Globals.ROOT_URL_PATTERN.test(icon)) {
		getIcon = Promise.resolve({url: Globals.getURL(icon)});
	} else {
		getIcon = Promise.resolve({url: Globals.getURL((root || '') + icon)});
	}

	return getIcon;
}


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.ExternalToolAsset', {
	extend: 'NextThought.common.components.cards.Card',

	alias: [
		'widget.course-overview-externaltoolasset',
		'widget.course-overview-lticonfiguredtool',
	],

	doNotRenderIcon: true,

	constructor: function (config) {
		var n = config.node || {getAttribute: function (a) { return config[a];} },
			i = config.locationInfo || {
				root: config.course && config.course.getContentRoots() && config.course.getContentRoots()[0]
			},
			root = i && i.root,
			ntiid = n.getAttribute('ntiid'),
			href = Globals.getURL('') + "/dataserver2/Objects/" + ntiid + '/@@launch';


		resolveIcon(config, n, root)
			.then((icon = {}) => {
				this.data.thumbnail = icon.url;
				this.data.extension = icon.extension;
				this.data.iconCls = icon.iconCls;


				if (this.iconEl) {
					this.iconEl.addCls([icon.extension || '', icon.iconCls || '']);
					this.iconEl.setStyle({backgroundImage: `url('${icon.url}')`});
				}

				if (this.extensionEl && icon.extension) {
					this.extensionEl.update(icon.extension);
				}
			});

		config.data = {
			description: n.getAttribute('desc') || n.getAttribute('description'),
			ntiid: ntiid,
			creator: n.getAttribute('byline') || n.getAttribute('creator'),
			title: n.getAttribute('title') || n.getAttribute('label'),
			'attribute-data-href': href, href: href,
		};

		this.callParent([config]);

	},

});
