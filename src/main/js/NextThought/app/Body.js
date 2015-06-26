Ext.define('NextThought.app.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',

	state_key: 'main-view',

	requires: [
		'NextThought.app.library.Index',
		'NextThought.app.content.Index',
		'NextThought.app.course.Index',
		'NextThought.app.search.Index',
		'NextThought.app.notifications.Index',
		'NextThought.util.Parsing',
		'NextThought.app.navigation.StateStore',
		'NextThought.app.navigation.path.Actions',
		'NextThought.app.windows.Index',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.Actions',
		'NextThought.app.context.StateStore'
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
			'push-window': this.pushWindow.bind(this)
		});
		this.mon(this.ContextStore, 'new-context', this.onNewContext.bind(this));

		this.addRoute('/library', this.setLibraryActive.bind(this));
		this.addRoute('/course/:id', this.setCourseActive.bind(this));
		this.addRoute('/bundle/:id', this.setBundleActive.bind(this));
		this.addRoute('/notifications/', this.setNotificationsActive.bind(this));
		this.addRoute('/search/', this.setSearchActive.bind(this));

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


	getCmp: function(xtype) {
		var cmp = this.down(xtype);

		if (!cmp) {
			cmp = this.add(Ext.widget(xtype));

			this.addChildRouter(cmp);
		}

		return cmp;
	},


	setActiveCmp: function(xtype) {
		var cmp = this.getCmp(xtype);

		this.getLayout().setActiveItem(cmp);

		return cmp;
	},


	beforeRoute: function() {
		this.WindowActions.closeActiveWindow();
	},


	onNewContext: function() {
		var id = this.ContextStore.getCurrentObjectId(),
			state = window.location.hash.replace('#', '');

		if (id) {
			this.WindowActions.showWindow(id, state);
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


	pushWindow: function(id, state, title, route, precache) {
		if (!title) {
			title = this.ContextStore.getCurrentTitle();
		}

		if (!route) {
			route = this.ContextStore.getCurrentRoute();
		}

		if (id) {
			id = ParseUtils.encodeForURI(id);
			route = Globals.trimRoute(route) + '/object/' + id;
		} else {
			state = null;
			route = this.ContextStore.removeObjectRoute();
		}

		if (state) {
			route += '#' + state;
		}


		this.pushRoute(title, route, precache, state);
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


	setNotificationsActive: function(route, subRoute) {
		var me = this,
			notableView = me.setActiveCmp('notifications-index');

		return notableView.handleRoute(subRoute, route.precache);
	},


	setSearchActive: function(route, subRoute) {
		var searchView = this.setActiveCmp('search-index');

		return searchView.handleRoute(subRoute, route.precache);
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


	updateBodyContent: function(bundle, masked) {
		var body = Ext.getBody(),
			mask = document.querySelector('.body-shade-mask');

		if (!bundle) {
			body.setStyle({backgroundImage: ''});
		} else {
			bundle.getBackgroundImage()
				.then(function(src) {
					body.setStyle({backgroundImage: 'url(' + src + ')'});
				});
		}

		//if we should mask make sure there is a mask element
		if (masked) {
			if (!mask) {
				mask = this.__createMaskDiv();
			}
		//else if we shouldn't mask and we already have a mask element
		//remove it
		} else if (mask) {
			document.body.removeChild(mask);
		}
	},


	getObjectRoute: function(obj) {
		return this.PathActions.getPathToObject(obj)
			.then(this.getRouteForPath.bind(this))
			.fail(function(reason) {
				console.error(('Unable to find path for: ', obj, reason));
				return {
					title: 'Library',
					route: '/library'
				};
			});
	},


	getRouteForPath: function(path) {
		var root = path[0],
			subPath = path.slice(1),
			route;

		if (root.isCourse) {
			route = this.getRouteForCourse(root, subPath);
		} else {
			console.error('No route for path: ', root, subPath);
			route = '';
		}

		return route;
	},



	getRouteForCourse: function(course, path) {
		var cmp = this.getCmp('course-view-container'),
			route = cmp.getRouteForPath && cmp.getRouteForPath(path),
			id = course.getId();

		id = ParseUtils.encodeForURI(id);

		route = Globals.trimRoute(route);

		return '/course/' + id + '/' + route;
	}
});
