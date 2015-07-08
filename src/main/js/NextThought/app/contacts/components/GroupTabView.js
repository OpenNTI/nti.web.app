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
		cls: 'make-white contact-panel',
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
		var s = this.GroupStore.getAllContactsStore();

		if (Ext.isFunction(this.filter)) {
			s.filter(this.filter);
		}

		this.navigation.bindStore(s);
		this.body.bindStore(s);
	}
});
