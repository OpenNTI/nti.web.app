//SCSS in _sidebar.scss
Ext.define('NextThought.view.SideBarTabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.sidebar-tabpanel',
	ui: 'sidebar',
	plain: true,
	cls: 'sidebar-panel-container',
	tabBar: {
		baseCls: 'sidebar-tab-bar',
		plain: true,
		ui: 'sidebar',
		defaults: {
			plain: true,
			ui: 'sidebar'
		}
	}


});
