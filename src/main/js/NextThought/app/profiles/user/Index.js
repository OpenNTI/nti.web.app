Ext.define('NextThought.app.profiles.user.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.app.navigation.Actions',
		'NextThought.app.profiles.user.components.Header',
		'NextThought.app.profiles.user.components.activity.Stream',
		'NextThought.app.profiles.user.components.about.About'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'user-profile profile',

	layout: 'none',

	initComponent: function() {
		this.callParent(arguments);

		this.NavActions = NextThought.app.navigation.Actions.create();
		this.GroupStore = NextThought.app.groups.StateStore.getInstance();

		this.headerCmp = this.add({
			xtype: 'profile-user-header',
			saveProfile: this.saveProfile.bind(this)
		});

		this.bodyCmp = this.add({
			xtype: 'container',
			layout: 'card'
		});

		this.initRouter();

		this.addRoute('/about', this.showAbout.bind(this));
		this.addRoute('/activity', this.showActivity.bind(this));

		this.addDefaultRoute('/activity');

		window.saveProfile = this.saveProfile.bind(this);
	},


	onAddedToParentRouter: function() {
		this.headerCmp.pushRoute = this.pushRoute.bind(this);
	},


	setActiveUser: function(id, user) {
		var me = this,
			lowerId = id.toLowerCase();


		if (me.activeUser && (me.activeUser.get('Username') || '').toLowerCase() === lowerId) {
			me.getUser = Promise.resolve(me.activeUser);
		} else if (user && (user.get('Username') || '').toLowerCase() == lowerId) {
			me.activeUser = user;
			me.getUser = Promise.resolve(user);
		} else {
			me.getUser = UserRepository.getUser(id)
				.then(function(user) {
					me.activeUser = user;

					me.isMe = isMe(user);

					return user;
				});
		}

		return me.getUser;
	},


	getRouteTilte: function() {
		return this.activeUser.getName();
	},


	setActiveItem: function(xtype) {
		var cmp = this.down(xtype);

		if (!cmp) {
			cmp = this.bodyCmp.add(Ext.widget(xtype));

			this.addChildRouter(cmp);
		}

		this.bodyCmp.getLayout().setActiveItem(cmp);

		return cmp;
	},


	setState: function(active) {
		var tabs = [],
			isContact = this.GroupStore.isContact(this.activeUser);

		tabs.push({
			label: 'About',
			route: '/about',
			active: active === 'about'
		});

		tabs.push({
			label: 'Activity',
			route: '/activity',
			active: active === 'activity'
		});

		this.headerCmp.updateUser(this.activeUser, tabs, isContact);

		this.NavActions.updateNavBar({
			hideBranding: true
		});
	},


	showAbout: function(route, subRoute) {
		var aboutCmp = this.setActiveItem('profile-user-about'),
			headerCmp = this.headerCmp;

		this.setState('about');

		if (this.isMe) {
			this.activeUser.getSchema()
				.then(function(schema) {
					aboutCmp.setSchema(schema);
					headerCmp.setSchema(schema);
				});
		}

		return aboutCmp.userChanged(this.activeUser, this.isMe)
			.then(aboutCmp.handleRoute.bind(aboutCmp, subRoute, route.params));
	},


	showActivity: function(route, subRoute) {
		var activityCmp = this.setActiveItem('profile-user-activity'),
			headerCmp = this.headerCmp;

		this.setState('activity');

		if (this.isMe) {
			this.activeUser.getSchema()
				.then(function(schema) {
					headerCmp.setSchema();
				});
		}

		return activityCmp.handleRoute(subRoute, route.precache);
	},


	saveProfile: function() {
		if (!this.isMe) { return Promise.resolve(false); }

		var aboutCmp = this.bodyCmp.down('profile-user-about');

		if (this.bodyCmp.getLayout().getActiveItem() !== aboutCmp) {
			return Promise.resolve(false);
		}

		if (!aboutCmp.validate()) {
			return Promise.resolve(true);
		}

		return aboutCmp.saveEdits();
	}
});
