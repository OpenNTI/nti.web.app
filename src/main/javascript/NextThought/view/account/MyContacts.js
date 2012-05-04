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
					title: 'Active in...',
					defaults: {
						items: [{type: 'comment',	message: 'Testing...'},
								{type: 'highlight',	message: 'Testing...'},
								{type: 'note',		message: 'Testing...'}]
					},
					items: [
						{},{},{}
					]
				},
				{
					title: 'Online',
					items: [
						{},{}
					]
				},
				{
					collapsed: true,
					showCount: false,
					title: 'Offline',
					items: []
				}
			]
		}
	]
});
