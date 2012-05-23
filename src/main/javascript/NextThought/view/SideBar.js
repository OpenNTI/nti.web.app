Ext.define('NextThought.view.SideBar',{
	extend: 'Ext.container.Container',
	alias: 'widget.main-sidebar',

	requires: [
		'NextThought.view.account.MyAccount',
		'NextThought.view.account.MyContacts'
	],

	width: 275,
	layout: 'vbox',

	items: [
		{xtype: 'my-account'},
		{xtype: 'my-contacts', flex:1}
	]
});
