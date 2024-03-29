const Ext = require('@nti/extjs');
const AnalyticsUtil = require('internal/legacy/util/Analytics');

require('internal/legacy/mixins/Router');
require('internal/legacy/model/User');
require('./parts/Users');
require('./parts/Admins');

module.exports = exports = Ext.define(
	'NextThought.app.profiles.group.components.membership.Index',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.group-profile-membership',

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		cls: 'memberships-container',

		items: [
			{ xtype: 'profile-group-membership-administrators' },
			{ xtype: 'profile-group-membership-users' },
		],

		initComponent: function () {
			this.callParent(arguments);

			this.initRouter();

			this.addRoute('/', this.onRoute.bind(this));

			this.addDefaultRoute('/');

			this.membershipCmp = this.down(
				'profile-group-membership-users(true)'
			);
			this.adminCmp = this.down(
				'profile-group-membership-administrators(true)'
			);

			this.on({
				activate: this.startResourceViewed.bind(this),
				deactivate: this.stopResourceViewed.bind(this),
			});
		},

		startResourceViewed: function () {
			var id = this.activeUser?.getId();

			if (id && !this.hasCurrentTimer) {
				AnalyticsUtil.startEvent(id, {
					type: 'ProfileMembershipView',
					rootContextId: this.activeUser.get('NTIID'),
				});

				this.hasCurrentTimer = true;
			}
		},

		stopResourceViewed: function () {
			var id = this.activeUser?.getId();

			if (id && this.hasCurrentTimer) {
				AnalyticsUtil.stopEvent(id, 'ProfileMembershipView');
				delete this.hasCurrentTimer;
			}
		},

		userChanged: function (user, isMe) {
			if (this.activeUser !== user) {
				this.stopResourceViewed();
			}

			this.activeUser = user;

			this.startResourceViewed();

			return Promise.all([
				this.membershipCmp.setUser(user, isMe),
				this.adminCmp.setUser(user, isMe),
			]);
		},

		onRoute: function () {
			this.setTitle('Members');
		},
	}
);
