Ext.define('NextThought.view.ViewSelect', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.view-select',

	requires: [
		'NextThought.view.menus.Navigation',
		'NextThought.view.menus.navigation.Collection'
	],

	cls: 'view-switcher',
	layout: {
		type: 'vbox',
		pack: 'start'
	},

	defaults: {
		xtype: 'button',
		ui: 'view',
		scale: 'large',
		cls: 'view-button',
		allowDepress: false,
		enableToggle: true,
		toggleGroup: 'view-select',
		modeReference: null
	},
	items: [
		{
			hidden: true,
			disabled: true,
			pressed: true,
			iconCls: 'home',
			title: 'Profile',
			tooltip: 'Home/Profile'
		},
		{
			iconCls: 'library',
			title: 'Library',
			tooltip: 'Library',
			switchView: false,
			menu: {
				xtype: 'navigation-menu',
				items:[
				   {xtype:'navigation-collection'}
				]
			}
		},
		{
			iconCls: 'forums',
			title: 'Forums',
			tooltip: 'Forums'
		},
		{
			iconCls: 'contacts',
			title: 'Contacts',
			tooltip: 'Contacts'
		},
		{
			iconCls: 'search',
			title: 'Search',
			tooltip: 'Search',
			switchView: false,
			menu: {
				xtype: 'navigation-menu',
				layout: {type: 'vbox', align: 'stretch'},
				overflowX: 'hidden',
				overflowY: 'hidden',
				items:[
					{ xtype: 'searchfield' },
					{ xtype: 'container',
					  overflowX: 'hidden',
					  overflowY: 'scroll',
					  id: 'search-results',
					  hideMode: 'display',
					  flex: 1 }
				],
				listeners:{
					show: function(m){
						m.down('searchfield').focus(true, true);
					}
				}
			}
		}
	],

	afterRender: function(){
		this.callParent(arguments);
		//This is our way for identifying coppa right now, don't give them the contacts view
		//TODO let them click it but show a resend consent page, it is safer
		if(!$AppConfig.service.canFriend()){
			this.down('[title=Contacts]').hide();
		}
	}
});
