Ext.define( 'NextThought.view.views.Contacts', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.contacts-view-container',
	requires: [
		'NextThought.view.contacts.Grouping',
		'NextThought.view.contacts.TabPanel',
		'Ext.ux.layout.Center'
	],

	cls: 'contacts-view',
	layout: 'ux.center',

	items: [{
		xtype: 'contacts-tabs',
		minWidth: 700,
		widthRatio: 0.8,
		items: [
			{title: 'Contacts', source: 'contacts' },
//			{title: 'Following', source: 'following' },
			{title: 'Distribution Lists', source: 'lists', defaultType: 'contacts-tabs-grouping' },
			{title: 'Groups', source: 'groups', defaultType: 'contacts-tabs-grouping' }
		]
	}]
});
