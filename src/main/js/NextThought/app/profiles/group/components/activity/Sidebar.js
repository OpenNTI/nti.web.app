Ext.define('NextThought.app.profiles.group.components.activity.Sidebar', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-group-activity-sidebar',

	requires: [
		'NextThought.app.profiles.group.components.activity.parts.Users'
	],
		   
	layout: 'none',

	cls: 'activity-sidebar',

	items: [
		{xtype: 'profile-group-membership-condensed'}
	],
		   
	userChanged: function(entity){
		var membership = this.down('profile-group-membership-condensed');
		if(!membership){
		   return Promise.reject();
		}
		return membership.setUser(entity);
	}
});
