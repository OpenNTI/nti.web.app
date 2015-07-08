Ext.define('NextThought.app.profiles.group.components.activity.Index', {
	extend: 'NextThought.app.profiles.user.components.activity.Index',
	alias: 'widget.profile-group-activity',

	requires: [
		'NextThought.app.profiles.group.components.activity.Stream',
		'NextThought.app.profiles.group.components.activity.Sidebar',
		'NextThought.app.userdata.Actions'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'activity-page',

	layout: 'none',

	items: [
		{xtype: 'profile-group-activity-stream'},
		{xtype: 'profile-group-activity-sidebar'}
	],


	initChildComponentRefs: function(){
		this.streamCmp = this.down('profile-group-activity-stream');
		this.sidebarCmp = this.down('profile-group-activity-sidebar');
		this.membershipCmp = this.down('profile-group-membership-condensed');
	},
	
	onAddedToParentRouter: function() {
		var me = this;

		this.membershipCmp.gotoSeeAll = function() {
			me.gotoMembership();
		};
	},
		   
	userChanged: function(){
		var superP = this.callParent(arguments);
		return Promise.all([
			   superP,
			   this.sidebarCmp.userChanged.apply(this.sidebarCmp, arguments)
			   ]);
	}
});
