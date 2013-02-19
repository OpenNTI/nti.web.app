Ext.define( 'NextThought.view.views.Contacts', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.contacts-view-container',
	requires: [
		'NextThought.view.contacts.TabPanel'
	],

	cls: 'contacts-view',

	items: [{
		xtype: 'contacts-tabs',
		items: [
			{title: 'Contacts', source: 'contacts' },
			{title: 'Following', source: 'following' },
			{title: 'Distribution Lists', source: 'lists' },
			{title: 'Groups', source: 'groups' }
		]
	}]
});
