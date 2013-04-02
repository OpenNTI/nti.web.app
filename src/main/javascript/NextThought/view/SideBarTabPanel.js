//SCSS in _sidebar.scss
Ext.define('NextThought.view.SideBarTabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.sidebar-tabpanel',
	ui: 'sidebar',
	plain: true,
	cls: 'sidebar-panel-container',
	stateful: true,
	stateEvents:['tabchange'],
	tabBar: {
		baseCls: 'sidebar-tab-bar',
		plain: true,
		ui: 'sidebar',
		defaults: {
			plain: true,
			ui: 'sidebar'
		}
	},

	applyState: function(state){
		var t = (state||{}).t||0;

		this.setActiveTab(t);
	},

	getState: function(){
		return {t:this.items.indexOf(this.getActiveTab())};
	}
});
