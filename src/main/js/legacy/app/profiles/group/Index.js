const Ext = require('extjs');

const {isMe} = require('legacy/util/Globals');
const GroupsActions = require('legacy/app/groups/Actions');

require('../user/Index');
require('../user/components/membership/Index');
require('./components/Header');
require('./components/activity/Index');
require('./components/membership/Index');


module.exports = exports = Ext.define('NextThought.app.profiles.group.Index', {
	extend: 'NextThought.app.profiles.user.Index',
	alias: 'widget.profile-group',
	cls: 'group-profile profile',

	initRoutes: function () {
		this.addRoute('/activity', this.showActivity.bind(this));
		this.addRoute('/members', this.showMembership.bind(this));

		this.addDefaultRoute('/activity');

		this.GroupActions = GroupsActions.create();
	},

	buildHeaderComponent: function () {
		return {
			xtype: 'profile-group-header',
			doLeaveGroup: this.leaveGroup.bind(this)
		};
	},

	finalizeInit: Ext.emptyFn,

	setState: function (active) {
		var tabs = [];

		this.activeTab = active;

		tabs.push({
			label: 'Activity',
			route: '/activity',
			active: active === 'activity'
		});

		tabs.push({
			label: 'Members',
			route: '/members',
			active: active === 'members'
		});

		this.headerCmp.updateEntity(this.activeEntity, tabs);

		this.NavActions.updateNavBar({
			hideBranding: true
		});

		this.NavActions.setActiveContent(this.activeEntity);
	},

	resolveEntity: function (id, entity) {
		var me = this;
		return Service.getObject(id)
			.then(function (user) {
				me.activeEntity = user;

				me.isMe = isMe(user);

				return user;
			});
	},

	showMembership: function (route, subRoute) {
		var membershipCmp = this.setActiveItem('group-profile-membership');

		this.setState('members');


		return membershipCmp.userChanged(this.activeEntity, false)
			.then(membershipCmp.handleRoute.bind(membershipCmp, subRoute, route.params));
	},

	showActivity: function (route, subRoute) {
		var activityCmp = this.setActiveItem('profile-group-activity');

		activityCmp.gotoMembership = this.pushRoute.bind(this, 'Members', '/members');
		this.setState('activity');

		return activityCmp.userChanged(this.activeEntity, false)
			.then(activityCmp.handleRoute.bind(activityCmp, subRoute, route.params));
	},

	leaveGroup: function () {
		var me = this,
			user = $AppConfig.userObject;

		if (me.activeEntity) {
			Ext.Msg.show({
				title: 'Are you sure?',
				msg: 'You will no longer have access to ' + me.activeEntity.getName(),
				buttons: {
					primary: {
						text: 'Yes',
						handler: function () {
							me.GroupActions.leaveGroup(me.activeEntity)
								.then(function () {
									me.pushRootRoute(user.getName(), '/user/' + user.getURLPart());
								});
						}
					},
					secondary: 'No'
				}
			});
		}
	}
});
