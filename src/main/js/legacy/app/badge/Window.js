const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const Badge = require('legacy/model/openbadges/Badge');

const StateStore = require('../windows/StateStore');

require('../windows/components/Header');
require('legacy/mixins/ExportBadge');
require('./components/Badge');
require('./components/Footer');
require('./components/Prompt');
require('../prompt/Actions');



module.exports = exports = Ext.define('NextThought.app.badge.Window', {
	extend: 'Ext.container.Container',

	mixins: {
		'exportBadge': 'NextThought.mixins.ExportBadge'
	},

	layout: 'none',
	cls: 'badge-window',

	initComponent: function () {
		this.callParent(arguments);

		this.add({xtype: 'window-header', doClose: this.doClose.bind(this)});

		this.add({xtype: 'badge-info', badge: this.record});
		this.add({xtype: 'badge-window-footer', doClose: this.doClose.bind(this), onExport: this.exportBadgeClicked.bind(this)});
	},

	exportBadgeClicked: function (e) {
		var target = e && e.getTarget();
		this.showExportMenu(this.record, Ext.get(target));
	}
}, function () {
	StateStore.register(Badge.mimeType, this);
	StateStore.registerCustomResolver(Badge.mimeType, function (id, raw) {
		var workspace = Service.getWorkspace('Badges'),
			earnedLink = getBadgesLink(workspace.Items, 'EarnedBadges'),
			link = Service.getLinkFrom(workspace.Links, 'OpenBadges'),
			targetLink;

		function getBadgesLink (items, type) {
			var i, item, href;
			items = items || [];
			for (i = 0; i < items.length && !link; i++) {
				item = items[i];
				if (type === item.Title) {
					href = item.href;
				}
			}

			return href;
		}

		targetLink = '/' + Globals.trimRoute(link) + '/' + raw;

		// NOTE: When we request the badges directly through the link we build using the OpenBadges URL,
		// we get the right object back but they are not decorated with links. With the links object missing
		// we cannot properly allow/disallow the user from exporting the badges when some preconditions may not be met.
		// Ideally the server should be returning the appropriate links.
		//
		// As a workaround, we are building the href given the id of the badge.
		// Then, we load all earned badges and filter the one with the requested href.
		// FIXME: This will fail if the badge hasn't been earned yet.
		if (earnedLink) {
			return Service.request(earnedLink)
				.then(function (collection) {
					var badge, record,
						badges = JSON.parse(collection).Items;

					for (let i = 0; i < badges.length; i++) {
						badge = badges[i];
						if (badge.href === targetLink) {
							record = badge;
						}
					}

					return record ? lazy.ParseUtils.parseItems(record)[0] : Promise.reject();
				});
		}

		return Service.request('/' + Globals.trimRoute(link) + '/' + raw)
			.then(function (badge) {
				return lazy.ParseUtils.parseItems(badge)[0];
			});
	});
});
