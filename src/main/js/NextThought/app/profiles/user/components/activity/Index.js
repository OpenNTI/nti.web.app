Ext.define('NextThought.app.profiles.user.components.activity.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity',

	requires: [
		'NextThought.app.profiles.user.components.activity.Stream',
		'NextThought.app.profiles.user.components.activity.Sidebar',
		'NextThought.app.userdata.Actions'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'activity-page',

	layout: 'none',

	items: [
		{xtype: 'profile-user-activity-stream'},
		{xtype: 'profile-user-activity-sidebar'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.flatPageStore = NextThought.store.FlatPage.create();
		this.UserDataActions = NextThought.app.userdata.Actions.create();

		this.UserDataActions.initPageStores(this);
		this.UserDataActions.setupPageStoreDelegates(this);

		this.streamCmp = this.down('profile-user-activity-stream');
		this.sidebarCmp = this.down('profile-user-activity-sidebar');

		this.sidebarCmp.updateFilter = this.updateFilter.bind(this);

		this.initRouter();

		this.addRoute('/', this.onRoute.bind(this));

		this.addDefaultRoute('/');
	},


	userChanged: function(user, isMe) {

		this.activeUser = user;
		this.isMe = isMe;

		this.store = this.buildStore();
		this.streamCmp.setStore(this.store, user);

		return Promise.resolve();
	},


	buildStore: function() {
		var username = this.activeUser.getId(),
			id = 'profile-activity-' + username,
			s = Ext.getStore(id);

		if (!s) {
			s = NextThought.store.ProfileItem.create({id: id});
		}

		s.proxy.url = this.activeUser.getLink('Activity');

		if (!s.proxy.url) {
			//don't attempt to do anything if no url
			s.setProxy('memory');
		}

		function makeMime(v) {
			return 'application/vnd.nextthought.' + v.toLowerCase();
		}

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
			sortOn: 'createdTime',
			sortOrder: 'descending',
			exclude: [
				'redaction',
				'bookmark',
				//'forums.CommentPost',
				'assessment.AssessedQuestion'
			].map(makeMime).join(',')
		});

		if (!this.hasPageStore(s.storeId)) {
			s.doesNotClear = true;
			s.doesNotShareEventsImplicitly = true;
			s.profileStoreFor = username;
			this.addPageStore(s.storeId, s);
		}

		return s;
	},


	applyState: function() {},


	updateFilter: function() {},


	onRoute: function() {
		this.setTitle('Activity');
	}
});
