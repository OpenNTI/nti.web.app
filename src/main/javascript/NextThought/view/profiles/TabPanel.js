Ext.define('NextThought.view.profiles.TabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.profile-tabs',

	plain: true,
	ui: 'profile',
	
	componentLayout: 'profiletabpanel',

	tabBar: {
		plain: true,
		baseCls: 'nti',
		ui: 'profile-tabbar',
		cls: 'profile-tabs',
		defaults: { plain: true, ui: 'profile-tab' }
	}

});

// prevent the layout manager from moving the tab panel back into
// its original dom pos. because we're changing it in
// NextThought.view.profiles.Panel # handleScrollHeaderLock

Ext.define('NextThought.layout.component.ProbileTabPanelLayout', {
	extend: 'Ext.layout.component.Dock',
	alias: 'layout.profiletabpanel',
	type: 'profiletabpanel',

	isValidParent: function(item, target, position) {
		if (target.hasCls('x-panel-profile')) return true;
		else return this.callParent(arguments);
	}
});