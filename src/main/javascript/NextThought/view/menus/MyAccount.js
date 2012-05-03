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
		{text: 'My Account'},
		{text: 'Settings'},
		{text: 'About'},
		{text: 'Help'},
		{xtype: 'menuseparator'},
		{text: 'Sign out'}
	],

	initComponent: function(){
		this.callParent(arguments);
		this.on('click',this.handleClick,this);
	},


	handleClick: function(menu,item){
		if(!item || !item.ntiid){
			return;
		}
	}
});
