Ext.define('NextThought.app.contacts.components.ListView', {
	extend: 'NextThought.app.contacts.components.TabView',
	alias: 'widget.lists-tab-view',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.util.Store',
		'NextThought.model.User'
	],

	navigation: {
		xtype: 'contacts-outline',
		cls: 'list',
		subType: 'list',
		outlineLabel: getString('contacts_all_list')
	},

	body: {
		xtype: 'data-bound-panel',
		defaultType: 'contacts-tabs-grouping',
		items: [],
		ui: 'contacts-list',
		cls: 'make-white contact-panel',
		emptyCmp: {
			xtype: 'box', emptyState: true,
			renderTpl: Ext.DomHelper.markup([{
				cls: 'empty-state', cn: [
					{cls: 'header', html: '{{{no_list_header}}}'},
					{cls: 'sub', html: '{{{no_list_sub}}}'}
				]
			}])
		}
	},

	subType: 'list',

	filter: function(group) { return group.hidden !== true && !group.isDFL; },

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
