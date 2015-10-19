Ext.define('NextThought.app.contacts.components.GroupTabView', {
	extend: 'NextThought.app.contacts.components.TabView',
	alias: 'widget.groups-tab-view',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.util.Store',
		'NextThought.model.User'
	],

	navigation: {
		xtype: 'contacts-outline',
		cls: 'group',
		subType: 'group',
		outlineLabel: getString('contacts_all_group')
	},


	body: {
		xtype: 'data-bound-panel',
		defaultType: 'contacts-tabs-grouping',
		items: [],
		ui: 'contacts-group',
		cls: 'group-panel',
		filter: function(group) { return group.hidden !== true && group.isDFL; },
		emptyCmp: {
			xtype: 'box', emptyState: true,
			renderTpl: Ext.DomHelper.markup([{
				cls: 'empty-state', cn: [
					{cls: 'header', html: '{{{no_group_header}}}'},
					{cls: 'sub', html: '{{{no_group_sub}}}'}
				]
			}])
		}
	},

	filter: function(group) { return group.hidden !== true && group.isDFL; },

	subType: 'group',

	initComponent: function () {
		this.callParent(arguments);

		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.buildStore();
	},


	buildStore: function() {
		var s = this.GroupStore.getGroupsList(),
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
			'afterrender': this.navigation.refresh.bind(this.navigation),
			single: true
		});
		this.body.doRefresh(s);
	}
});
