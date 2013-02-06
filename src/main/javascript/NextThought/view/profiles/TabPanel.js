Ext.define('NextThought.view.profiles.TabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.profile-tabs',

	plain: true,
	ui: 'profile',
	minWidth: 550,

	tabBar: {
		plain: true,
		baseCls: 'nti',
		ui: 'profile-tabbar',
		defaults: { plain: true, ui: 'profile-tab' }
	}

});
