Ext.define('NextThought.view.content.TabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.content-tabs',
	requires: [
		'NextThought.view.content.PageWidgets'
	],

	plain: true,
	ui: 'content-tab',
	flex: 1,

	tabBar: {
		width: 710,
		plain: true,
		baseCls: 'nti',
		ui: 'content-tabbar',
		defaults: { plain: true, ui: 'content-tab' }
	},

	/**
	 * We need to move the tabbar into a container so that we can position it correctly. So we hook the init
	 * of the tabbar
	 */
	initComponent: function(){
		this.dockedItems = [{dock: 'top', xtype: 'content-page-widgets'}];
		this.callParent(arguments);
		this.removeDocked(this.tabBar,false);
		this.dockedItems.first().add(this.tabBar);
	}
});
