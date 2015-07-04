Ext.define('NextThought.app.profiles.user.components.membership.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.user-profile-membership',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'memberships-container',

	items: [
		{xtype: 'profile-user-membership-communities'},
		{xtype: 'profile-user-membership-groups'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.onRoute.bind(this));

		this.addDefaultRoute('/');

		this.communitiesCmp = this.down('profile-user-membership-communities');
		this.groupsCmp = this.down('profile-user-membership-groups');
	},


	userChanged: function(user, isMe) {
		return Promise.all([
				this.communitiesCmp.setUser(user, isMe),
				this.groupsCmp.setUser(user, isMe)
			]);
	},


	onRoute: function() {
		this.setTitle('Membership');
	}
});
