
Ext.define('NextThought.view.frame.ModeSelect', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.mode-select',

	cls: 'mode-switcher',
	layout: {
		type: 'hbox',
		pack: 'start'
	},

	defaults: {
		margin: '5px 0 5px 2px',
		xtype: 'button',
		ui: 'mode',
		scale: 'large',
		cls: 'mode-button',
		allowDepress: false,
		enableToggle: true,
		toggleGroup: 'mode-select',
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
			tooltip: 'Library'
		},
		{
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
