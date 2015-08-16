Ext.define('NextThought.app.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',

	state_key: 'main-view',

	requires: [
		'NextThought.app.library.Index',
		'NextThought.app.bundle.Index',
		'NextThought.app.content.Index',
		'NextThought.app.course.Index',
		'NextThought.app.search.Index',
		'NextThought.app.profiles.user.Index',
		'NextThought.app.profiles.group.Index',
		'NextThought.app.profiles.community.Index',
		'NextThought.app.notifications.Index',
		'NextThought.util.Parsing',
		'NextThought.app.navigation.StateStore',
		'NextThought.app.navigation.path.Actions',
		'NextThought.app.windows.Index',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.Actions',
		'NextThought.app.context.StateStore',
		'NextThought.app.contacts.Index'
	],

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	layout: 'card',

	cls: 'main-body',

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.PathActions = NextThought.app.navigation.path.Actions.create();
		this.NavigationStore = NextThought.app.navigation.StateStore.getInstance();
		this.WindowStore = NextThought.app.windows.StateStore.getInstance();
		this.WindowActions = NextThought.app.windows.Actions.create();
		this.ContextStore = NextThought.app.context.StateStore.getInstance();

		this.mon(this.NavigationStore, 'set-active-content', this.updateBodyContent.bind(this));
		this.mon(this.WindowStore, {
			'push-window': this.pushWindow.bind(this),
			'replaceOpenWindowRoute': this.replaceOpenWindowRoute.bind(this),
			'navigate-to-record': this.navigateToWindowRecord.bind(this)
		});

		this.mon(this.ContextStore, 'new-context', this.onNewContext.bind(this));

		this.addRoute('/library', this.setLibraryActive.bind(this));
		this.addRoute('/course/:id', this.setCourseActive.bind(this));
		this.addRoute('/bundle/:id', this.setBundleActive.bind(this));
		this.addRoute('/user/:id', this.setUserActive.bind(this));
		this.addRoute('/group/:id', this.setGroupActive.bind(this));
		this.addRoute('/community/:id', this.setCommunityActive.bind(this));
		this.addRoute('/notifications/', this.setNotificationsActive.bind(this));
		this.addRoute('/search/', this.setSearchActive.bind(this));
		this.addRoute('/contacts/', this.setContactsActive.bind(this));
		this.addRoute('/id/:id', this.setObjectActive.bind(this));

		this.addDefaultRoute('/library');

		this.addDefaultObjectHandler(this.getObjectRoute.bind(this));
	},


	allowNavigation: function() {
		var win = this.WindowStore.allowNavigation();

		//if the window stops it or returns a promise don't keep looking
		if ((win === false) || win instanceof Promise) {
			return win;
		}

		return this.mixins.Router.allowNavigation.call(this);
	},


	getCmp: function(xtype, cmpQuery) {
		var cmp = this.down(cmpQuery || xtype);

		if (!cmp) {
			cmp = this.add(Ext.widget(xtype));

			this.addChildRouter(cmp);
		}

		return cmp;
	},


	setActiveCmp: function(xtype, cmpQuery) {
		var old = this.getLayout().getActiveItem();
			cmp = this.getCmp(xtype, cmpQuery);

		this.getLayout().setActiveItem(cmp);

		//if there wasn't already an active item the activate event won't
		//get fired, and some views rely on it to setup properly
		if (!old) {
			cmp.fireEvent('activate');
		}


		return cmp;
	},


	beforeRoute: function() {
		this.WindowActions.closeActiveWindow();
	},


	onNewContext: function() {
		var parts = this.ContextStore.getCurrentObjectParts();

		if (parts.mimeType && parts.id) {
			this.WindowActions.showWindowWithMimeType(parts.id, parts.mimeType, parts.state);
		} else if (parts.id) {
			this.WindowActions.showWindow(parts.id, parts.state);
		}
	},


	lockHeight: function() {
		if (!this.rendered) {
			this.on('afterrender', this.lockHeight.bind(this));
			return;
		}

		var headerHeight = this.el.dom.getBoundingClientRect().top,
			windowHeight = Ext.Element.getViewportHeight();

		this.el.setStyle({height: (windowHeight - headerHeight) + 'px'});
		this.addCls('height-locked');
	},


	unlockHeight: function() {
		if (!this.rendered) {
			this.on('afterrender', this.unlockHeight.bind(this));
			return;
		}

		this.el.setStyle({height: 'auto'});
		this.removeCls('height-locked');
	},


	navigateToWindowRecord: function(record) {
		this.attemptToNavigateToObject(record);
	},

	pushWindow: function(id, mimeType, state, title, route, precache) {
		if (!title) {
			title = this.ContextStore.getCurrentTitle();
		}

		if (!route) {
			route = this.ContextStore.getCurrentRoute();
		}

		var location = Globals.getURLParts(route),
			search = this.ContextStore.getCurrentSearch(),
			hash = this.ContextStore.getCurrentHash();

		if (id) {
			if (id === this.ContextStore.getCurrentObjectId()) {
				return;
			}

			id = ParseUtils.encodeForURI(id);

			if (mimeType) {
				mimeType = encodeURIComponent(mimeType);
				location.pathname = Globals.trimRoute(location.pathname) + '/object/' + mimeType + '/' + id;
			} else if (state) {
				state = encodeURIComponent(state);
				location.pathname = Globals.trimRoute(location.pathname) + '/object/' + id + '/' + state;
			} else {
				location.pathname = Globals.trimRoute(location.pathname) + '/object/' + id;
			}
		} else {
			state = null;
			location.pathname = this.ContextStore.removeObjectRoute();
		}

		if (search) {
			location.search = location.search || search;
		}

		if (hash) {
			location.hash = location.hash || hash;
		}

		route = location.pathname + location.search + location.hash;

		this.pushRoute(title, route, precache, state);
	},


	replaceOpenWindowRoute: function() {
		var route = this.ContextStore.removeObjectRoute(),
			title = this.ContextStore.getCurrentTitle();

		this.replaceRootRoute(title, route);
	},


	setLibraryActive: function(route, subRoute) {
		var library = this.setActiveCmp('library-view-container');

		return library.handleRoute(subRoute, route.precache);
	},


	setCourseActive: function(route, subRoute) {
		var me = this,
			courseView = me.setActiveCmp('course-view-container'),
			ntiid = route.params.id,
			course = route.precache.course;

		ntiid = ParseUtils.decodeFromURI(ntiid);

		return courseView.setActiveCourse(ntiid, course)
			.then(courseView.handleRoute.bind(courseView, subRoute, route.precache))
			.fail(function() {
				me.replaceRoute('', '/library');
			});
	},


	setBundleActive: function(route, subRoute) {
		var me = this,
			bundleView = me.setActiveCmp('bundle-view-container'),
			ntiid = route.params.id,
			bundle = route.precache.bundle;

		ntiid = ParseUtils.decodeFromURI(ntiid);

		return bundleView.setActiveBundle(ntiid, bundle)
			.then(bundleView.handleRoute.bind(bundleView, subRoute, route.precache))
			.fail(function() {
				me.replaceRoute('', '/library');
			});
	},

	setGroupActive: function(route, subRoute) {
		var me = this,
		   userView = me.setActiveCmp('profile-group', 'profile-group(true)'),
		   id = route.params.id,
		   user = route.precache.user;

		id = ParseUtils.decodeFromURI(id);

		return userView.setActiveEntity(id, user)
		   .then(userView.handleRoute.bind(userView, subRoute, route.precache))
		   .fail(function() {
				 me.replaceRoute('', '/library');
				 });
	},

	setUserActive: function(route, subRoute) {
		var me = this,
			userView = me.setActiveCmp('profile-user', 'profile-user(true)'),
			id = route.params.id,
			user = route.precache.user;

		id = NextThought.model.User.getIdFromURIPart(id);

		return userView.setActiveEntity(id, user)
			.then(userView.handleRoute.bind(userView, subRoute, route.precache))
			.fail(function() {
				me.replaceRoute('', '/library');
			});
	},


	setCommunityActive: function(route, subRoute) {
		var me = this,
			communityView = me.setActiveCmp('profile-community'),
			id = route.params.id,
			community = route.precache.community;

		id = decodeURIComponent(id);

		return communityView.setActiveEntity(id, community)
			.then(communityView.handleRoute.bind(communityView, subRoute, route.precache))
			.fail(function() {
				me.replaceRoute('', '/library');
			});
	},


	setNotificationsActive: function(route, subRoute) {
		var me = this,
			notableView = me.setActiveCmp('notifications-index');

		return notableView.handleRoute(subRoute, route.precache);
	},


	setSearchActive: function(route, subRoute) {
		var searchView = this.setActiveCmp('search-index');

		return searchView.handleRoute(subRoute, route.precache);
	},


	setContactsActive: function(route, subRoute) {
		var contactsView = this.setActiveCmp('contacts-index');

		return contactsView.handleRoute(subRoute, route.precache);
	},


	setObjectActive: function(route, subRoute) {
		var me = this,
			id = route.params.id;

		function doNavigate(obj, route) {
			var path = route.path,
				objId = obj.getId(),
				hasWindow = me.Router.WindowActions.hasWindow(obj);

			objId = ParseUtils.encodeForURI(objId);

			if (hasWindow) {
				path = Globals.trimRoute(path) + '/object/' + objId;
			}

			me.el.unmask();
			me.replaceRootRoute('', path);
		}

		function failedNavigate(obj) {
			var objId = obj && obj.getId(),
				path = '/library',
				hasWindow = obj && me.Router.WindowActions.hasWindow(obj);

			objId = obj && ParseUtils.encodeForURI(objId);

			if (hasWindow) {
				path = path + '/object/' + objId;
			}

			me.el.unmask();
			me.replaceRootRoute('', path);
		}

		me.el.mask('Loading...');

		id = id && ParseUtils.decodeFromURI(id);

		if (!id) {
			me.el.unmask();
			me.replaceRoute('Library', '/library');
			return;
		}

		Service.getObject(id)
			.then(function(obj) {
				me.attemptToNavigateToObject(obj, {
					doNavigateToFullPath: doNavigate,
					onFailedToGetFullPath: failedNavigate
				});
			})
			.fail(function() {
				failedNavigate();
			});
	},


	/**
	 * Create and append a div to the body with a class of body-shade-mask
	 * to add come contrast
	 *
	 * @return {Element} the element created and added
	 */
	__createMaskDiv: function() {
		var div = document.createElement('div');

		div.classList.add('body-shade-mask');

		document.body.appendChild(div);

		return div;
	},

	removeBodyContent: function(content) {
		var body = Ext.getBody();

		if (content && content.BODY_CLS) {
			body.removeCls(content.BODY_CLS);
		}

		body.setStyle({backgroundImage: ''});
	},


	addBodyContent: function(content) {
		var body = Ext.getBody(),
			getBackground = content && content.getBackgroundImage && content.getBackgroundImage();

		if (content && content.BODY_CLS) {
			body.addCls(content.BODY_CLS);
		}

		if (getBackground) {
			getBackground
				.then(function(src) {
					body.setStyle({backgroundImage: 'url(' + src + ')'});
				});
		}
	},


	updateBodyContent: function(content, masked) {
		var body = Ext.getBody(),
			getBackground = content && content.getBackgroundImage && content.getBackgroundImage(),
			mask = document.querySelector('.body-shade-mask');

		if (content !== this.activeContent) {
			this.removeBodyContent(this.activeContent);
			this.addBodyContent(content);
		}

		this.activeContent = content;

		//if we should mask make sure there is a mask element
		if (masked) {
			if (!mask) {
				mask = this.__createMaskDiv();
			}
		} else if (mask) {
			document.body.removeChild(mask);
		}
	},


	getObjectRoute: function(obj) {
		return this.PathActions.getPathToObject(obj)
			.then(function(path) {
				path.push(obj);

				return path;
			})
			.then(this.getRouteForPath.bind(this))
			.then(function(route) {
				return route.path;
			})
			.fail(function(reason) {
				console.error(('Unable to find path for: ', obj, reason));
				return {
					title: 'Library',
					route: '/library'
				};
			});
	},


	getRouteForPath: function(path) {
		var root = path && path[0],
			subPath = path && path.slice(1),
			route;

		if (root && root.isCourse) {
			route = this.getRouteForCourse(root, subPath);
		} else if (root instanceof NextThought.model.ContentPackage) {
			route = this.getRouteForBundle(NextThought.model.ContentBundle.fromPackage(root), subPath);
		} else if (root instanceof NextThought.model.ContentBundle) {
			route = this.getRouteForBundle(root, subPath);
		} else if (root instanceof NextThought.model.User) {
			route = this.getRouteForUser(root, subPath);
		} else if (root instanceof NextThought.model.Community) {
			route = this.getRouteForCommunity(root, subPath);
		} else if (root instanceof NextThought.model.DynamicFriendsList) {
			route = this.getRouteForGroup(root, subPath);
		} else {
			console.error('No route for path: ', root, subPath);
			route = {
				isFull: false,
				isAccessble: false
			};
		}

		return route;
	},



	getRouteForCourse: function(course, path) {
		var cmp = this.getCmp('course-view-container'),
			route = cmp.getRouteForPath && cmp.getRouteForPath(path, course),
			id = course.getId();

		id = ParseUtils.encodeForURI(id);

		route.path = Globals.trimRoute(route.path);

		route.path = '/course/' + id + '/' + route.path;

		return route;
	},


	getRouteForUser: function(user, path) {
		var cmp = this.getCmp('profile-user', 'profile-user(true)'),
			route = cmp.getRouteForPath && cmp.getRouteForPath(path, user),
			id = user.getId();

		route.path = Globals.trimRoute(route.path);
		route.path = '/user/' + id + '/' + route.path;

		return route;
	},


	getRouteForCommunity: function(community, path) {
		var cmp = this.getCmp('profile-community'),
			route, id = community.getId();

		if (path.length) {
			route = cmp.getRouteForPath && cmp.getRouteForPath(path, community);
		} else {
			route = {
				isFull: true,
				path: ''
			};
		}

		route.path = Globals.trimRoute(route.path);
		route.path = '/community/' + id + '/' + route.path;

		return route;
	},


	getRouteForGroup: function(group, path) {
		var cmp = this.getCmp('profile-group'),
			route, id = group.getId();

		id = ParseUtils.encodeForURI(id);

		if (path.length) {
			route = cmp.getRouteForPath && cmp.getRouteForPath(path, group);
		} else {
			route = {
				isFull: true,
				path: ''
			};
		}

		route.path = Globals.trimRoute(route.path);
		route.path = '/group/' + id + '/' + route.path;

		return route;
	},


	getRouteForBundle: function(bundle, path) {
		var cmp = this.getCmp('bundle-view-container'),
			route, id = bundle.get('NTIID');

		id = ParseUtils.encodeForURI(id);

		if (path.length) {
			route = cmp.getRouteForPath && cmp.getRouteForPath(path, bundle);
		} else {
			route = {
				isFull: true,
				path: ''
			};
		}

		route.path = Globals.trimRoute(route.path);
		route.path = '/bundle/' + id + '/' + route.path;

		return route;
	}
});
