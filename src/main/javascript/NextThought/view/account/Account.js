Ext.define('NextThought.view.account.Account',{
	extend: 'Ext.container.Container',
	alias: 'widget.account-view',
	requires: [
		'NextThought.view.account.Notifications'
	],

	iconCls: 'account',
	tooltip: 'My Account',
	ui: 'account',
	cls: 'account-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'box', cls: 'view-title', autoEl: {html: 'My Account'}},
		{
			xtype: 'container',
			flex: 1,
			autoScroll: true,
			layout: 'auto',//{ type: 'vbox', align: 'stretch' },
			defaults: {
				xtype: 'box',
				autoEl: 'a',
				cls: 'item',
				isMenuItem: true,
				listeners: {
					afterRender: function(i){
						i.mon(i.el,'click',function(){i.fireEvent('click',i);},i);
					}
				}
			},
			items:[
			{xtype: 'notifications', cls: 'notifications'},

			{html: ' ', autoEl: 'div'},
//			{html: 'Account Settings', action: 'account' },
			{html: 'About', href: 'http://www.nextthought.com/', hrefTarget: '_blank'},
			{html: 'Help', action: 'help'},
			{html: 'Privacy', action: 'privacy'},
			{html: 'Terms of Service', action: 'terms'},

			{html: ' ', autoEl: 'div'},

			{html: 'Sign out', action: 'logout'}
			]
		}
	]
});
