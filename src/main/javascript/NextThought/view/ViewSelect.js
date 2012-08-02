Ext.define('NextThought.view.ViewSelect', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.view-select',

	requires: [
		'NextThought.view.menus.Navigation'
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
			pressed: true,
			iconCls: 'home',
			title: 'Home',
			tooltip: 'Home/Profile'
		},
		{
			iconCls: 'library',
			title: 'Library',
			tooltip: 'Library',
			menu: {xtype: 'navigation-menu'}
		},
		{
			disabled: true,
			iconCls: 'classroom',
			title: 'Classroom',
			tooltip: 'Classroom'
		},
		{
			iconCls: 'search',
			title: 'Search',
			tooltip: 'Search'
		}
	]
});
