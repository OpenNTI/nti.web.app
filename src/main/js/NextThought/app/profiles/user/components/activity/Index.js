Ext.define('NextThought.app.profiles.user.components.activity.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity',

	requires: [
		'NextThought.app.profiles.user.components.activity.Body',
		'NextThought.app.profiles.user.components.activity.Sidebar',
		'NextThought.app.userdata.Actions',
		'NextThought.app.stream.util.StreamSource'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'activity-page',

	layout: 'none',

	items: [
		{xtype: 'profile-user-activity-body'},
		{xtype: 'profile-user-activity-sidebar'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.flatPageStore = NextThought.store.FlatPage.create();
		this.UserDataActions = NextThought.app.userdata.Actions.create();

		this.UserDataActions.initPageStores(this);
		this.UserDataActions.setupPageStoreDelegates(this);

		this.initChildComponentRefs();

		this.streamCmp.navigateToObject = this.navigateToActivityItem.bind(this);

		this.sidebarCmp.updateFilter = this.updateFilter.bind(this);

		this.initRouter();

		this.addRoute('/', this.onRoute.bind(this));

		this.addDefaultRoute('/');


		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this)
		});
	},


	startResourceViewed: function() {
		var id = this.activeUser && this.activeUser.getId();

		if (id && !this.hasCurrentTimer) {
			AnalyticsUtil.getResourceTimer(id, {
				type: 'profile-activity-viewed',
				ProfileEntity: id
			});

			this.hasCurrentTimer = true;
		}
	},


	stopResourceViewed: function() {
		var id = this.activeUser && this.activeUser.getId();

		if (id && this.hasCurrentTimer) {
			AnalyticsUtil.stopResourceTimer(id, 'profile-activity-viewed');
			delete this.hasCurrentTimer;
		}
	},


	getSuggestedSharing: function() {
		var community = Service.getFakePublishCommunity();

		return NextThought.model.UserSearch.create(community.getData());
	},


	onActivate: function() {
		this.startResourceViewed();
		this.items.each(function(item) {
			item.fireEvent('activate');
		});
	},


	onDeactivate: function() {
		this.stopResourceViewed();
		this.items.each(function(item) {
			item.fireEvent('deactivate');
		});
	},


	initChildComponentRefs: function() {
		this.streamCmp = this.down('profile-user-activity-body');
		this.sidebarCmp = this.down('profile-user-activity-sidebar');
	},

	userChanged: function(user, isMe) {
		if (this.activeUser === user) {
			return Promise.resolve();
		}

		this.stopResourceViewed();

		this.activeUser = user;
		this.isMe = isMe;

		this.startResourceViewed();

		return Promise.all([
				this.streamCmp.userChanged.apply(this.streamCmp, arguments),
				this.sidebarCmp.userChanged.apply(this.sidebarCmp, arguments)
			]);
	},


	applyState: function() {},


	updateFilter: function(filter) {
		this.replaceRoute('Activity', '/?' + Ext.Object.toQueryString(filter));
	},


	onRoute: function(route, subRoute) {
		this.setTitle('Activity');

		var streamParams;

		this.sidebarCmp.setFilterFromQueryParams(route.queryParams);

		streamParams = this.sidebarCmp.getStreamParams();
		streamParams.url = this.activeUser.getLink('Activity');

		this.streamCmp.setStreamParams(streamParams);
	},


	navigateToActivityItem: function(item) {
		this.Router.root.attemptToNavigateToObject(item);
	}
});
