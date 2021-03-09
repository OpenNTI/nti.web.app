const Ext = require('@nti/extjs');
const AnalyticsUtil = require('internal/legacy/util/Analytics');
const FlatPage = require('internal/legacy/store/FlatPage');
const UserdataActions = require('internal/legacy/app/userdata/Actions');
const UserSearch = require('internal/legacy/model/UserSearch');

require('internal/legacy/mixins/Router');
require('internal/legacy/mixins/State');
require('internal/legacy/app/profiles/user/components/activity/Body');
require('internal/legacy/app/profiles/user/components/activity/Sidebar');
require('internal/legacy/app/stream/util/StreamSource');

module.exports = exports = Ext.define(
	'NextThought.app.profiles.user.components.activity.Index',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.profile-user-activity',

		STATE_KEY: 'profile_activity',

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		cls: 'activity-page',
		layout: 'none',

		items: [
			{ xtype: 'profile-user-activity-body' },
			{ xtype: 'profile-user-activity-sidebar' },
		],

		initComponent: function () {
			this.callParent(arguments);

			this.flatPageStore = FlatPage.create();
			this.UserDataActions = UserdataActions.create();

			this.UserDataActions.initPageStores(this);
			this.UserDataActions.setupPageStoreDelegates(this);

			this.initChildComponentRefs();

			this.streamCmp.navigateToObject = this.navigateToActivityItem.bind(
				this
			);

			this.sidebarCmp.setStreamCmp(this.streamCmp.getStreamCmp());

			this.initRouter();

			this.addRoute('/', this.onRoute.bind(this));

			this.addDefaultRoute('/');

			this.stateKey = 'profile-activity-filters';
		},

		startResourceViewed: function () {
			var id = this.activeUser && this.activeUser.getId();

			if (id && !this.hasCurrentTimer) {
				AnalyticsUtil.startEvent(id, {
					type: 'ProfileActivityView',
					rootContextId: this.activeUser.get('NTIID'),
				});
				this.hasCurrentTimer = true;
			}
		},

		stopResourceViewed: function () {
			var id = this.activeUser && this.activeUser.getId();

			if (id && this.hasCurrentTimer) {
				AnalyticsUtil.stopEvent(id, 'ProfileActivityView');
				delete this.hasCurrentTimer;
			}
		},

		getSuggestedSharing: function () {
			var community = Service.getFakePublishCommunity();

			return UserSearch.create(community.getData());
		},

		onRouteActivate: function () {
			this.startResourceViewed();
			this.items.each(function (item) {
				item.fireEvent('activate');
			});
		},

		onRouteDeactivate: function () {
			this.stopResourceViewed();
			this.items.each(function (item) {
				item.fireEvent('deactivate');
			});
		},

		initChildComponentRefs: function () {
			this.streamCmp = this.down('profile-user-activity-body');
			this.sidebarCmp = this.down('profile-user-activity-sidebar');
		},

		userChanged: function (user, isMe) {
			if (this.activeUser === user) {
				return Promise.resolve();
			}

			this.stopResourceViewed();

			this.activeUser = user;
			this.isMe = isMe;

			this.startResourceViewed();

			return Promise.all([
				this.streamCmp.userChanged.apply(this.streamCmp, arguments),
				this.sidebarCmp.userChanged.apply(this.sidebarCmp, arguments),
			]);
		},

		onRoute: function (/*route, subRoute*/) {
			this.setTitle('Activity');

			return this.streamCmp.fetchNewItems();
		},

		navigateToActivityItem: function (item) {
			this.Router.root.attemptToNavigateToObject(item);
		},
	}
);
