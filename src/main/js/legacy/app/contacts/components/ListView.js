const Ext = require('@nti/extjs');
const { getString } = require('internal/legacy/util/Localization');
const StoreUtils = require('internal/legacy/util/Store');
const GroupsStateStore = require('internal/legacy/app/groups/StateStore');

require('./TabView');

module.exports = exports = Ext.define(
	'NextThought.app.contacts.components.ListView',
	{
		extend: 'NextThought.app.contacts.components.TabView',
		alias: 'widget.lists-tab-view',

		navigation: {
			xtype: 'contacts-outline',
			cls: 'list',
			subType: 'list',
			outlineLabel: getString('contacts_all_list'),
		},

		body: {
			xtype: 'data-bound-panel',
			defaultType: 'contacts-tabs-grouping',
			items: [],
			ui: 'contacts-list',
			cls: 'list-panel',
			filter: function (group) {
				return group.hidden !== true && !group.isDFL;
			},
			emptyCmp: {
				xtype: 'box',
				emptyState: true,
				renderTpl: Ext.DomHelper.markup([
					{
						cls: 'empty-state',
						cn: [
							{ cls: 'header', html: '{{{no_list_header}}}' },
							{ cls: 'sub', html: '{{{no_list_sub}}}' },
						],
					},
				]),
			},
		},

		subType: 'list',
		filter: function (group) {
			return group.hidden !== true && !group.isDFL;
		},

		initComponent: function () {
			this.callParent(arguments);

			this.GroupStore = GroupsStateStore.getInstance();
			this.buildStore();
		},

		buildStore: function () {
			var s = this.GroupStore.getFriendsList(),
				store = StoreUtils.newView(s);

			if (Ext.isFunction(this.filter)) {
				store.filter(this.filter);
			}

			this.body.bindStore(s);
			this.navigation.bindStore(store);

			// FIXME: for some reason the first time this is shown
			// if it's not the active view, it doesn't display the navigation records.
			// For now add force it to refresh.
			this.navigation.on({
				afterrender: this.navigation.refresh.bind(this.navigation),
				single: true,
			});
			this.body.doRefresh(s);
		},
	}
);
