Ext.define('NextThought.app.profiles.group.components.activity.Index', {
	extend: 'NextThought.app.profiles.user.components.activity.Index',
	alias: 'widget.profile-group-activity',

	requires: [
		'NextThought.app.profiles.group.components.activity.Body',
		'NextThought.app.profiles.group.components.activity.Sidebar',
		'NextThought.app.profiles.group.components.activity.parts.NewPost',
		'NextThought.app.userdata.Actions'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'activity-page',

	layout: 'none',

	items: [
		{xtype: 'profile-group-activity-body'},
		{xtype: 'profile-group-activity-sidebar'}
	],


	initChildComponentRefs: function() {
		this.streamCmp = this.down('profile-group-activity-body');
		this.sidebarCmp = this.down('profile-group-activity-sidebar');
		this.membershipCmp = this.down('profile-group-membership-condensed');

		this.streamCmp.navigateToObject = this.navigateToActivityItem.bind(this);
	},

	onAddedToParentRouter: function() {
		var me = this;

		this.membershipCmp.gotoSeeAll = function() {
			me.gotoMembership();
		};
	},


	navigateToActivityItem: function(item, monitors) {
		this.Router.root.attemptToNavigateToObject(item, monitors);
	}
});
