Ext.define('NextThought.view.profiles.TabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.profile-tabs',

	plain: true,
	ui: 'profile',

	tabBar: {
		plain: true,
		baseCls: 'nti',
		ui: 'profile-tabbar',
		cls: 'profile-tabs',
		defaults: { plain: true, ui: 'profile-tab' }
	}

});
