Ext.define('NextThought.app.contacts.components.ContactTabView', {
	extend: 'NextThought.app.contacts.components.TabView',
	alias: 'widget.contacts-tab-view',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.util.Store',
		'NextThought.model.User'
	],

	navigation: {
		xtype: 'contacts-outline',
		cls: 'contact',
		subType: 'contact',
		outlineLabel: getString('NextThought.view.contacts.View.contact-tab')
	},

	body: {
		xtype: 'data-bound-panel',
		defaultType: 'contacts-tabs-card',
		items: [],
		ui: 'contacts-contact',
		cls: 'make-white contact-panel',
		emptyCmp: {
			xtype: 'box', emptyState: true,
			renderTpl: Ext.DomHelper.markup([{
				cls: 'empty-state', cn: [
					{cls: 'header', html: '{{{no_contact_header}}}'},
					{cls: 'sub', html: '{{{no_contact_sub}}}'}
				]
			}])
		}
	},

	subType: 'contact',

	initComponent: function () {
		this.callParent(arguments);

		debugger;
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
