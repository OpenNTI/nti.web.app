Ext.define('NextThought.app.profiles.user.components.activity.Sidebar', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity-sidebar',

	layout: 'none',

	cls: 'activity-sidebar',

	items: [
		{xtype: 'box', autoEl: {html: 'Sidebar'}}
	]
});
