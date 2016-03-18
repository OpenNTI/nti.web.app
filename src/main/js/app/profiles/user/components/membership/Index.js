var Ext = require('extjs');
var User = require('../../../../../model/User');
var AnalyticsUtil = require('../../../../../util/Analytics');
var MixinsRouter = require('../../../../../mixins/Router');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.membership.Index', {
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
				this.communitiesCmp.setUser(user, isMe),
				this.groupsCmp.setUser(user, isMe)
			]);
	},


	onRoute: function() {
		this.setTitle('Membership');
	}
});
