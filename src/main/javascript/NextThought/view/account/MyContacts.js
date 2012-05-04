Ext.define('NextThought.view.account.MyContacts',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.my-contacts',
	requires: [
		'NextThought.view.account.contacts.Card',
		'NextThought.view.account.contacts.Panel'
	],
	ui: 'my-contacts',
	cls: 'my-contacts',
	plain: true,
	tabBar: {
		baseCls: 'my-contacts-tab-bar',
		plain: true,
		ui: 'my-contacts',
		defaults: {
			plain: true,
			ui: 'my-contacts'
		}
	},

	defaults :{
		autoScroll: true,
		overflowX: 'hidden',
		xtype: 'container',
		defaults: {
			width: 275,
			xtype: 'contacts-panel'
		}
	},

	items: [
		{
			title: 'People',
			items: [
				{ id: 'activity-stream', title: 'Active' },
				{ id: 'online-contacts', title: 'Online' },
				{ id: 'offline-contacts', title: 'Offline', collapsed: true, showCount: false }
			]
		},
		{ id: 'my-groups', title: 'Groups' }
	]
});
