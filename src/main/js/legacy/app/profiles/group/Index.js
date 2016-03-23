var Ext = require('extjs');
var UserIndex = require('../user/Index');
var ComponentsHeader = require('./components/Header');
var MembershipIndex = require('../user/components/membership/Index');
var ActivityIndex = require('./components/activity/Index');
var MembershipIndex = require('./components/membership/Index');
var GroupsActions = require('../../groups/Actions');
var {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.profiles.group.Index', {
	extend: 'NextThought.app.profiles.user.Index',
	alias: 'widget.profile-group',
	cls: 'group-profile profile',

	initRoutes: function() {
	   this.addRoute('/activity', this.showActivity.bind(this));
	   this.addRoute('/members', this.showMembership.bind(this));

	   this.addDefaultRoute('/activity');

	   this.GroupActions = NextThought.app.groups.Actions.create();
	},

	buildHeaderComponent: function() {
		return {
		   xtype: 'profile-group-header',
		   doLeaveGroup: this.leaveGroup.bind(this)
		};
	},

	finalizeInit: Ext.emptyFn,

	setState: function(active) {
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

	resolveEntity: function(id, entity) {
	   var me = this;
	   return Service.getObject(id)
		   .then(function(user) {
					me.activeEntity = user;

					me.isMe = isMe(user);

					return user;
				 });
	},

	showMembership: function(route, subRoute) {
		   var membershipCmp = this.setActiveItem('group-profile-membership'),
		   headerCmp = this.headerCmp;

		   this.setState('members');


		   return membershipCmp.userChanged(this.activeEntity, false)
		   .then(membershipCmp.handleRoute.bind(membershipCmp, subRoute, route.params));
	},

	showActivity: function(route, subRoute) {
		var activityCmp = this.setActiveItem('profile-group-activity'),
			headerCmp = this.headerCmp;

		activityCmp.gotoMembership = this.pushRoute.bind(this, 'Members', '/members');
		this.setState('activity');

		return activityCmp.userChanged(this.activeEntity, false)
		   .then(activityCmp.handleRoute.bind(activityCmp, subRoute, route.params));
	},

	leaveGroup: function() {
		var me = this,
			user = $AppConfig.userObject;

		if (me.activeEntity) {
			Ext.Msg.show({
				title: 'Are you sure?',
				msg: 'You will no longer have access to ' + me.activeEntity.getName(),
				buttons: {
					primary: {
						text: 'Yes',
						handler: function() {
							me.GroupActions.leaveGroup(me.activeEntity)
								.then(function() {
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
