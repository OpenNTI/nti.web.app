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
			title: 'Home',
			tooltip: 'Home/Profile'
		},
		{
			iconCls: 'library',
			title: 'Library',
			tooltip: 'Library',
			menu: {xtype: 'navigation-menu', items:[
				{xtype:'navigation-collection'}
			]}
		},
		{
			hidden: true,
			disabled: true,
			iconCls: 'classroom',
			title: 'Classroom',
			tooltip: 'Classroom'
		},
		{
			iconCls: 'search',
			title: 'Search',
			tooltip: 'Search',
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
//						reserveScrollbar: true,
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
	]
});
