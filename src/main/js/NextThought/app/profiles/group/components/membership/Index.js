Ext.define('NextThought.app.profiles.group.components.membership.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.group-profile-membership',
		   
   requires: ['NextThought.app.profiles.group.components.membership.parts.Users'],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'memberships-container',

	items: [
		{xtype: 'profile-group-membership-users'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.onRoute.bind(this));

		this.addDefaultRoute('/');

		this.membershipCmp = this.down('profile-group-membership-users');
	},


	userChanged: function(user, isMe) {
		return this.membershipCmp.setUser(user, isMe);
	},


	onRoute: function() {
		this.setTitle('Membership');
	}
});
