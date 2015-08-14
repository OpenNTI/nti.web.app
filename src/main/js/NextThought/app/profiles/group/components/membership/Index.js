Ext.define('NextThought.app.profiles.group.components.membership.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.group-profile-membership',

	requires: ['NextThought.app.profiles.group.components.membership.parts.Users',
		   'NextThought.app.profiles.group.components.membership.parts.Admins'],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'memberships-container',

	items: [
		{xtype: 'profile-group-membership-administrators'},
		{xtype: 'profile-group-membership-users'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.onRoute.bind(this));

		this.addDefaultRoute('/');

		this.membershipCmp = this.down('profile-group-membership-users(true)');
		this.adminCmp = this.down('profile-group-membership-administrators(true)');

		this.on({
			'activate': this.startResourceViewed.bind(this),
			'deactivate': this.stopResourceViewed.bind(this)
		});
	},


	startResourceViewed: function() {
		var id = this.activeUser && this.activeUser.getId();

		if (id && !this.hasCurrentTimer) {
			AnalyticsUtil.getResourceTimer(id, {
				type: 'profile-membership-viewed',
				ProfileEntity: id
			});

			this.hasCurrentTimer = true;
		}
	},


	stopResourceViewed: function() {
		var id = this.activeUser && this.activeUser.getId();

		if (id && this.hasCurrentTimer) {
			AnalyticsUtil.stopResourceTimer(id, 'profile-membership-viewed');
			delete this.hasCurrentTimer;
		}
	},


	userChanged: function(user, isMe) {
		if (this.activeUser !== user) {
			this.stopResourceViewed();
		}

		this.activeUser = user;

		this.startResourceViewed();

		return Promise.all([
				this.membershipCmp.setUser(user, isMe),
				this.adminCmp.setUser(user, isMe)
			]);
	},


	onRoute: function() {
		this.setTitle('Members');
	}
});
