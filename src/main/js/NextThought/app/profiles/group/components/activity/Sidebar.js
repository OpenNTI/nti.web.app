Ext.define('NextThought.app.profiles.group.components.activity.Sidebar', {
	extend: 'NextThought.app.profiles.user.components.activity.Sidebar',
	alias: 'widget.profile-group-activity-sidebar',

	requires: [
		'NextThought.app.profiles.group.components.activity.parts.Users',
		'NextThought.app.profiles.components.SuggestedContacts',
		'NextThought.app.stream.components.Filter'
	],

	layout: 'none',

	cls: 'activity-sidebar',

	items: [
		{xtype: 'stream-filter'},
		{xtype: 'profile-group-membership-condensed'},
		{xtype: 'profile-suggested-contacts'}
	],

	initComponent: function() {
		this.callParent(arguments);
		this.membershipCmp = this.down('profile-group-membership-condensed');
		this.suggestedCmp = this.down('profile-suggested-contacts');
	},

	userChanged: function(entity) {
		var me = this;
		return Promise.all([
			me.membershipCmp.setUser(entity),
			me.suggestedCmp.setEntity(entity)
		]);
	}
});
