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
			leaveCommunity: this.leaveCommunity.bind(this),
			showCommunity: this.showCommunity.bind(this),
			hideCommunity: this.hideCommunity.bind(this)
		});

		this.bodyCmp = this.add({
			xtype: 'container',
			cls: 'community-body',
			layout: 'card'
		});


		this.sidebarCmp = this.add({
			xtype: 'profile-community-sidebar',
			showForum: this.onShowForum.bind(this),
			gotoMembership: this.gotoMembership.bind(this)
		});

		this.initRouter();

		this.addRoute('/', this.showAllActivity.bind(this));
		this.addRoute('/topic/:id', this.showTopicActivity.bind(this));
		this.addRoute('/members', this.showMembers.bind(this));

		this.addDefaultRoute('/');

		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this)
		});
	},


	getContext: function() {
		return this.activeCommunity;
	},


	onActivate: function() {
		var cmp = this.bodyCmp.getLayout().getActiveItem();

		if (cmp) {
			cmp.fireEvent('activate');
		}

		this.headerCmp.fireEvent('activate');
	},


	onDeactivate: function() {
		var cmp = this.bodyCmp.getLayout().getActiveItem();

		if (cmp) {
			cmp.fireEvent('deactivate');
		}

		this.headerCmp.fireEvent('deactivate');
	},


	getRouteTitle: function() {
		return this.activeCommunity ? this.activeCommunity.getName() : '';
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

				//Call this with force to reload the forums incase there are any new ones
				me.activeCommunity.getForumList(true);
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

		this.activeCommunity.getDefaultForum()
			.then(cmp.setPostContainer.bind(cmp));

		this.setState({
			activeTopic: 'all'
		});

		return cmp.userChanged(this.activeCommunity)
			.then(cmp.handleRoute.bind(cmp, subRoute, route.precache));
	},


	showTopicActivity: function(route, subRoute) {
		var me = this,
			cmp = me.setActiveItem('profile-community-activity'),
			entity = me.activeCommunity,
			id = route.params.id, forum = route.precache.forum || cmp.getActiveForum();

		id = ParseUtils.decodeFromURI(id);

		if (forum && forum.getId() === id) {
			cmp.setSourceURL(forum.getLink('contents'));
			cmp.setPostContainer(forum);
		} else {
			cmp.setSourceURL(null);
			cmp.setPostContainer(null);

			entity.getForums()
				.then(function(topics) {
					var current, i;

					for (i = 0; i < topics.length; i++) {
						topic = topics[i];

						if (topic && topic.getId && topic.getId() === id) {
							current = topic;
							break;
						}
					}

					if (!topic) {
						return Promise.reject();
					}

					return topic;
				})
				.fail(function(reason) {
					console.error('failed to load forum: ', reason);

					cmp.setSourceURL(entity.getLink('Activity'));
					me.setState();

					entity.getDefaultForum()
						.then(cmp.setPostContainer.bind(cmp));
				})
				.then(function(forum) {
					var link = forum.getLink('contents');

					cmp.setSourceURL(link);

					cmp.setPostContainer(forum);
				});
		}

		me.setState({
			activeTopic: id
		});

		return cmp.userChanged(me.activeCommunity)
			.then(cmp.handleRoute.bind(cmp, subRoute, route.precache));
	},


	showMembers: function(route, subRoute) {
		var cmp = this.setActiveItem('profile-community-membership');

		this.setState();
		cmp.updateEntity(this.activeCommunity);

		return cmp.handleRoute(subRoute, route.precache);
	},


	updateCommunity: function() {
		this.setState(this.activeState);

		//TODO: reload what ever is active on the body
	},


	gotoMembership: function() {
		this.pushRoute('Members', '/members');
	},


	onShowForum: function(forum) {
		if (forum === 'all') {
			this.pushRoute('Activity', '/');
			return;
		}

		var id = forum.getId();

		id = ParseUtils.encodeForURI(id);

		this.pushRoute('', '/topic/' + id, {
			forum: forum
		});
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
	},


	showCommunity: function() {
		var me = this,
			show, link = me.activeCommunity.getLink('unhide');

		if (!link) {
			show = Promise.reject('No Link');
		} else {
			show = Service.post(link);
		}

		show
			.then(function(response) {
				me.activeCommunity = ParseUtils.parseItems(response)[0];
				me.updateCommunity();
			})
			.fail(function(reason) {
				console.error('Error hiding community: ', reason);
				alert('Unable to show community at this time.');
			});
	},


	hideCommunity: function() {
		var me = this,
			hide, link = me.activeCommunity.getLink('hide');

		if (!link) {
			hide = Promise.reject('No Link');
		} else {
			hide = Service.post(link);
		}

		hide
			.then(function(response) {
				me.activeCommunity = ParseUtils.parseItems(response)[0];
				me.updateCommunity();
			})
			.fail(function(reason) {
				console.error('Error hiding community: ', reason);
				alert('Unable to hide community at this time.');
			});
	},


	getRouteForPath: function(path, community) {
		var forum = path[1],//the first one should be the index
			forumId = forum.getId(),
			path = '/';

		forumId = ParseUtils.encodeForURI(forumId);

		if (!community.isDefaultForum(forum)) {
			path = '/topic/' + forumId;
		}

		return {
			isFull: true,
			path: path
		};
	}
});
