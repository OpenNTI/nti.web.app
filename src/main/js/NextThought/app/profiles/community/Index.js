Ext.define('NextThought.app.profiles.community.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-community',

	requires: [
		'NextThought.app.navigation.Actions',
		'NextThought.app.profiles.community.components.activity.Index',
		'NextThought.app.profiles.community.components.membership.Index',
		'NextThought.app.profiles.community.components.sidebar.Index',
		'NextThought.app.profiles.community.components.Header'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'community-profile profile',

	layout: 'none',


	initComponent: function() {
		this.callParent(arguments);

		this.NavActions = NextThought.app.navigation.Actions.create();

		this.headerCmp = this.add({
			xtype: 'profile-community-header',
			joinCommunity: this.joinCommunity.bind(this),
			leaveCommunity: this.leaveCommunity.bind(this)
		});

		this.bodyCmp = this.add({
			xtype: 'container',
			cls: 'community-body',
			layout: 'card'
		});


		this.sidebarCmp = this.add({
			xtype: 'profile-community-sidebar',
			showTopic: this.onShowTopic.bind(this)
		});

		this.initRouter();

		this.addRoute('/', this.showAllActivity.bind(this));
		this.addRoute('/topic/:id', this.showTopicActivity.bind(this));
		this.addRoute('/members', this.showMembers.bind(this));

		this.addDefaultRoute('/');
	},


	setActiveEntity: function(id, entity) {
		var me = this,
			url = Service.getResolveUserURL(id);

		if (me.activeCommunity && me.activeCommunity.getId() === id) {
			return Promise.resolve(me.acitveCommunity);
		}

		return Service.request(url)
			.then(function(response) {
				var json = JSON.parse(response) || {};

				return ParseUtils.parseItems(json.Items)[0];
			})
			.then(function(community) {
				me.activeCommunity = community;
				return community;
			});
	},


	setActiveItem: function(xtype) {
		var cmp = this.down(xtype),
			current = this.bodyCmp.getLayout().getActiveItem();

		if (!cmp) {
			cmp = this.bodyCmp.add(Ext.widget(xtype));

			this.addChildRouter(cmp);
		}

		this.bodyCmp.getLayout().setActiveItem(cmp);

		if (cmp && !current) {
			cmp.fireEvent('activate');
		}

		return cmp;
	},


	setState: function(state) {
		state = state || {};

		this.activeState = state;

		this.headerCmp.updateEntity(this.activeCommunity);
		this.sidebarCmp.updateEntity(this.activeCommunity, state.activeTopic);

		this.NavActions.updateNavBar({
			hideBranding: true
		});

		this.NavActions.setActiveContent(this.activeCommunity);
	},


	showAllActivity: function(route, subRoute) {
		var cmp = this.setActiveItem('profile-community-activity'),
			link = this.activeCommunity.getLink('Activity');

		cmp.setSourceURL(link);

		this.setState();

		return cmp.handleRoute(subRoute, route.precache);
	},


	showTopicActivity: function(route, subRoute) {
	},

	showMembers: function(route, subRoute) {
	},


	updateCommunity: function() {
		this.setState(this.activeState);

		//TODO: reload what ever is active on the body
	},


	onShowTopic: function() {
	},


	joinCommunity: function() {
		var me = this,
			join, link = me.activeCommunity.getLink('join');

		if (!link) {
			join = Promise.reject('No Link');
		} else {
			join = Service.post(link);
		}

		join
			.then(function(response) {
				me.activeCommunity = ParseUtils.parseItems(response)[0];
				me.updateCommunity();
			})
			.fail(function(reason) {
				console.error('Error joining community: ', reason);
				alert('Unable to join community at this time.');
			});

	},


	leaveCommunity: function() {
		var me = this,
			leave, link = me.activeCommunity.getLink('leave');

		if (!link) {
			leave = Promise.reject('No Link');
		} else {
			leave = Service.post(link);
		}

		leave
			.then(function(response) {
				me.activeCommunity = ParseUtils.parseItems(response)[0];
				me.updateCommunity();
			})
			.fail(function(reason) {
				console.error('Error leaving community: ', reason);
				alert('Unable to leave community at this time.');
			});
	}
});
