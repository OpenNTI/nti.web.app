Ext.define('NextThought.view.SideBar',{
	extend: 'Ext.container.Container',
	alias: 'widget.main-sidebar',

	requires: [
		'NextThought.view.account.MyAccount'
	],

	width: 275,
	layout: 'vbox',

	items: [
		{xtype: 'my-account'},
		{flex: 1, border: false}
	]
});
