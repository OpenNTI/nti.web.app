Ext.define('NextThought.view.account.MyContacts',{
	extend: 'Ext.container.Container',
	alias: 'widget.my-contacts',
	requires: [
		'NextThought.view.account.contacts.Card',
		'NextThought.view.account.contacts.Panel'
	],
	ui: 'my-contacts',
	cls: 'my-contacts',

	items: [
		{xtype: 'component', cls:'my-contacts-label', autoEl: 'div', html: 'Contacts'},
		{
			xtype: 'container',
			cls: 'something-clever',
			autoScroll: true,
			overflowX: 'hidden',
			defaults: {
				width: 275,
				xtype: 'contacts-panel',
				defaultType: 'contact-card'
			},
			items: [
				{
					id: 'activity-stream',
					title: 'Active in...'
				},
				{
					id: 'online-contacts',
					title: 'Online'
				},
				{
					id: 'offline-contacts',
					collapsed: true,
					showCount: false,
					title: 'Offline'
				}
			]
		}
	]
});
