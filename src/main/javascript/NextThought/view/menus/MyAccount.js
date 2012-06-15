Ext.define('NextThought.view.menus.MyAccount',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.my-account-menu',
	requires: [
		'NextThought.view.menus.account.Notifications'
	],
	ui: 'nt',
	cls: 'my-account-menu',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 250,
	width: 250,

	defaults: {
		ui: 'my-account',
		plain: true
	},

	items: [
		{xtype: 'notifications-menuitem'},
		{text: 'My Account', action: 'account' },
		{text: 'Settings',  disabled: true}, //TODO - re-enable when we have something for this
		{text: 'About', href: 'http://www.nextthought.com/', hrefTarget: '_blank'},
		{text: 'Help', href: 'mailto:alpha-support@nextthought.com', hrefTarget: '_blank'},
		{text: 'Privacy', action: 'privacy'},
		{xtype: 'menuseparator'},
		{text: 'Sign out', action: 'logout'}
	]
});
