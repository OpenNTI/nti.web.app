Ext.define('NextThought.view.profiles.TabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.profile-tabs',

	plain: true,
	ui: 'profile-tab',

	tabBar: {
		plain: true,
		baseCls: 'nti',
		ui: 'profile-tabbar',
		defaults: { plain: true, ui: 'profile-tab' }
	}

});
