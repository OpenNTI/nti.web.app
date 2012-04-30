
Ext.define('NextThought.view.ViewSelect', {
	extend: 'Ext.panel.Panel',
	alias : 'widget.view-select',

	cls: 'view-switcher',
	layout: {
		type: 'hbox',
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
			tooltip: 'Home/Profile',
			renderData: {text: '<span class="right cap"></span>'}
		},
		{
			iconCls: 'library',
			title: 'Library',
			tooltip: 'Library',
			renderData: {text: '<span class="left cap"></span><span class="right cap"></span>'}
		},
		{
			iconCls: 'classroom',
			title: 'Classroom',
			tooltip: 'Classroom',
			renderData: {text: '<span class="left cap"></span><span class="right cap"></span>'}
		},
		{
			iconCls: 'search',
			title: 'Search',
			tooltip: 'Search',
			renderData: {text: '<span class="left cap"></span>'}
		}
	]
});
