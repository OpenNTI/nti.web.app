var Ext = require('extjs');
var ActivityIndex = require('../../../user/components/activity/Index');
var MixinsRouter = require('../../../../../mixins/Router');
var ActivityBody = require('./Body');
var ActivitySidebar = require('./Sidebar');
var PartsNewPost = require('./parts/NewPost');
var UserdataActions = require('../../../../userdata/Actions');


module.exports = exports = Ext.define('NextThought.app.profiles.group.components.activity.Index', {
    extend: 'NextThought.app.profiles.user.components.activity.Index',
    alias: 'widget.profile-group-activity',

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
