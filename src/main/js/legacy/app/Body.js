const Ext = require('extjs');
const { isNTIID, encodeForURI, decodeFromURI } = require('nti-lib-ntiids');

const DynamicFriendsList = require('legacy/model/DynamicFriendsList');
const ContentBundle = require('legacy/model/ContentBundle');
const ContentPackage = require('legacy/model/ContentPackage');
const Community = require('legacy/model/Community');
const User = require('legacy/model/User');
const Globals = require('legacy/util/Globals');

const LibraryStateStore = require('./library/StateStore');
const NavigationStateStore = require('./navigation/StateStore');
const PathActions = require('./navigation/path/Actions');
const WindowsStateStore = require('./windows/StateStore');
const WindowsActions = require('./windows/Actions');
const ContextStateStore = require('./context/StateStore');

require('legacy/mixins/Router');
require('legacy/mixins/State');
require('legacy/mixins/Scrolling');
require('legacy/util/Parsing');

require('./library/Index');
require('./bundle/Index');
require('./content/Index');
require('./course/Index');
require('./search/Index');
require('./profiles/user/Index');
require('./profiles/group/Index');
require('./profiles/community/Index');
require('./notifications/Index');
require('./windows/Index');
// require('./contacts/Index');
require('./siteadmin/Index');
require('./catalog/Index');
require('./newContact/Index');


module.exports = exports = Ext.define('NextThought.app.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',
	stateKey: 'main-view',
	ISCHANGE: /change$/,

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State',
		Scrolling: 'NextThought.mixins.Scrolling'
	},

	layout: 'card',
	cls: 'main-body',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.PathActions = PathActions.create();
		this.NavigationStore = NavigationStateStore.getInstance();
		this.WindowStore = WindowsStateStore.getInstance();
		this.WindowActions = WindowsActions.create();
		this.ContextStore = ContextStateStore.getInstance();
		this.LibraryStore = LibraryStateStore.getInstance();

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
		this.addRoute('/catalog', this.setCatalogActive.bind(this));

		if(Service.getWorkspace('SiteAdmin')) {
			// only available if user has the admin workspace
			this.addRoute('/siteadmin', this.setAdminActive.bind(this));
		}

		this.addDefaultRoute('/library');

		this.addDefaultObjectHandler(this.getObjectRoute.bind(this));

		this.initScrolling();

		window.addEventListener('DOMMouseScroll', this.maybeStopScrollBleed.bind(this));
		window.addEventListener('mousewheel', this.maybeStopScrollBleed.bind(this));
		window.addEventListener('wheel', this.maybeStopScrollBleed.bind(this));
	},

	allowNavigation: function () {
		var win = this.WindowStore.allowNavigation();

		//if the window stops it or returns a promise don't keep looking
		if ((win === false) || win instanceof Promise) {
			return win;
		}

		return this.mixins.Router.allowNavigation.call(this);
	},

	getCmp: function (xtype, cmpQuery) {
		var cmp = this.down(cmpQuery || xtype);

		if (!cmp) {
			cmp = this.add(Ext.widget(xtype));
			this.addChildRouter(cmp);
		}

		return cmp;
	},

	setActiveCmp: function (xtype, cmpQuery) {
		var old = this.getLayout().getActiveItem();
		var cmp = this.getCmp(xtype, cmpQuery);

		this.getLayout().setActiveItem(cmp);

		//if there wasn't already an active item the activate event won't
		//get fired, and some views rely on it to setup properly
		if (!old) {
			cmp.fireEvent('activate');
		}

		if (cmp.fullwidth) {
			this.addCls('fullwidth');
		} else {
			this.removeCls('fullwidth');
		}


		return cmp;
	},

	beforeRoute: function () {
		this.WindowActions.closeActiveWindow();
	},

	onNewContext: function () {
		var parts = this.ContextStore.getCurrentObjectParts();

		if (parts.mimeType && parts.id) {
			this.WindowActions.showWindowWithMimeType(parts.id, parts.mimeType, parts.state, parts.rawId);
		} else if (parts.id) {
			this.WindowActions.showWindow(parts.id, parts.state);
		}
	},

	lockHeight: function () {
		if (!this.rendered) {
			this.on('afterrender', this.lockHeight.bind(this));
			return;
		}

		var headerHeight = this.el.dom.getBoundingClientRect().top,
			windowHeight = Ext.Element.getViewportHeight();

		this.el.setStyle({height: (windowHeight - headerHeight) + 'px'});
		this.addCls('height-locked');
	},

	unlockHeight: function () {
		if (!this.rendered) {
			this.on('afterrender', this.unlockHeight.bind(this));
			return;
		}

		this.el.setStyle({height: 'auto'});
		this.removeCls('height-locked');
	},

	navigateToWindowRecord: function (record) {
		this.attemptToNavigateToObject(record);
	},

	pushWindow: function (id, mimeType, state, title, route, precache) {
		if (!title) {
			title = this.ContextStore.getCurrentTitle();
		}

		if (!route) {
			route = this.ContextStore.getCurrentRoute() || '';
		}

		var location = Globals.getURLParts(route),
			search = this.ContextStore.getCurrentSearch(),
			hash = this.ContextStore.getCurrentHash();

		if (id) {
			if (id === this.ContextStore.getCurrentObjectId()) {
				return;
			}

			id = isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id);

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
			const objectLessUrl = this.ContextStore.removeObjectRoute();
			location.pathname = Globals.getURLParts(objectLessUrl).pathname;
		}

		if (search) {
			location.search = location.search || search;
		}

		if (hash) {
			location.hash = location.hash || hash;
		}

		route = location.pathname + (location.search || '') + (location.hash || '');

		this.pushRoute(title, route, precache, state);
	},

	replaceOpenWindowRoute: function () {
		var route = this.ContextStore.removeObjectRoute(),
			title = this.ContextStore.getCurrentTitle();

		this.replaceRootRoute(title, route);
	},

	setLibraryActive: function (route, subRoute) {
		var library = this.setActiveCmp('library-view-container');

		return library.handleRoute(subRoute, route.precache);
	},

	setCourseActive: function (route, subRoute) {
		var me = this,
			courseView = me.setActiveCmp('course-view-container'),
			ntiid = route.params.id,
			course = route.precache.course;

		ntiid = decodeFromURI(ntiid);

		return courseView.setActiveCourse(ntiid, course)
			.then(courseView.handleRoute.bind(courseView, subRoute, route.precache))
			.catch(function () {
				//If we have a sub route that fails try setting the root of the course
				if (Globals.trimRoute(subRoute)) {
					me.replaceRoute('', '/course/' + route.params.id);
				} else {
					alert('You do not have access to this course');

					me.replaceRoute('', '/library');
				}
			});
	},

	setBundleActive: function (route, subRoute) {
		var me = this,
			bundleView = me.setActiveCmp('bundle-view-container'),
			ntiid = route.params.id,
			bundle = route.precache.bundle;

		ntiid = decodeFromURI(ntiid);

		return bundleView.setActiveBundle(ntiid, bundle)
			.then(bundleView.handleRoute.bind(bundleView, subRoute, route.precache))
			.catch(function () {
				me.replaceRoute('', '/library');
			});
	},

	setGroupActive: function (route, subRoute) {
		var me = this,
			userView = me.setActiveCmp('profile-group', 'profile-group(true)'),
			id = route.params.id,
			user = route.precache.user;

		id = decodeFromURI(id);

		return userView.setActiveEntity(id, user)
			.then(userView.handleRoute.bind(userView, subRoute, route.precache))
			.catch(function (error) {
				me.replaceRoute('', '/library');
			});
	},

	setUserActive: function (route, subRoute) {
		var me = this,
			userView = me.setActiveCmp('profile-user', 'profile-user(true)'),
			id = route.params.id,
			user = route.precache.user;

		id = User.getIdFromURIPart(id);

		return userView.setActiveEntity(id, user)
			.then(userView.handleRoute.bind(userView, subRoute, route.precache))
			.catch(function () {
				me.replaceRoute('', '/library');
			});
	},

	setCommunityActive: function (route, subRoute) {
		var me = this,
			communityView = me.setActiveCmp('profile-community'),
			id = route.params.id,
			community = route.precache.community;

		id = decodeURIComponent(id);

		return communityView.setActiveEntity(id, community)
			.then(communityView.handleRoute.bind(communityView, subRoute, route.precache))
			.catch(function () {
				me.replaceRoute('', '/library');
			});
	},

	setNotificationsActive: function (route, subRoute) {
		var me = this,
			notableView = me.setActiveCmp('notifications-index');

		return notableView.handleRoute(subRoute, route.precache);
	},

	setAdminActive: function (route, subRoute) {
		var me = this,
			view = me.setActiveCmp('site-admin-index');

		return view.handleRoute(subRoute, route.precache);
	},

	setSearchActive: function (route, subRoute) {
		var searchView = this.setActiveCmp('search-index');

		return searchView.handleRoute(subRoute, route.precache);
	},

	setCatalogActive: function (route, subRoute) {
		var searchView = this.setActiveCmp('catalog-component');
		this.addCls('fullwidth');
		return searchView.handleRoute(subRoute, route.precache);

	},

	setContactsActive: function (route, subRoute) {
		var searchView = this.setActiveCmp('contact-component');

		return searchView.handleRoute(subRoute, route.precache);
	},

	setObjectActive: function (route, subRoute) {
		var me = this,
			hash = route.hash,
			id = route.params.id;

		function doNavigate (obj, {path}) {
			var objId = obj.getId(),
				hasWindow = me.Router.WindowActions.hasWindow(obj);

			objId = encodeForURI(objId);

			if (hasWindow) {
				path = Globals.trimRoute(path) + '/object/' + objId;
			}

			if (hash) {
				path = Globals.trimRoute(path) + '#' + hash;
			}

			me.el.unmask();
			me.replaceRootRoute('', path);
		}

		function failedNavigate (obj) {
			var objId = obj && obj.getId(),
				path = '/library',
				hasWindow = obj && me.Router.WindowActions.hasWindow(obj);

			objId = obj && encodeForURI(objId);

			if (hasWindow) {
				path = path + '/object/' + objId;
			}

			me.el.unmask();
			me.replaceRootRoute('', path);
		}

		me.el.mask('Loading...');

		id = id && decodeFromURI(id);

		if (!id) {
			me.el.unmask();
			me.replaceRoute('Library', '/library');
			return;
		}

		return Service.getObject(id)
			.then(function (obj) {
				if (me.ISCHANGE.test(obj.mimeType)) {
					obj = obj.getItem();
				}

				me.attemptToNavigateToObject(obj, {
					doNavigateToFullPath: doNavigate,
					onFailedToGetFullPath: failedNavigate
				});
			})
			.catch(function () {
				failedNavigate();
			});
	},

	/**
	 * Create and append a div to the body with a class of body-shade-mask
	 * to add come contrast
	 *
	 * @return {Element} the element created and added
	 */
	__createMaskDiv: function () {
		var div = document.createElement('div');

		div.classList.add('body-shade-mask');

		document.body.appendChild(div);

		return div;
	},

	removeBodyContent: function (content) {
		var body = Ext.getBody();

		if (content && content.BODY_CLS) {
			body.removeCls(content.BODY_CLS);
		}

		body.setStyle({backgroundImage: ''});
	},

	addBodyContent: function (content) {
		var body = Ext.getBody(),
			getBackground = content && content.getBackgroundImage && content.getBackgroundImage();

		if (content && content.BODY_CLS) {
			body.addCls(content.BODY_CLS);
		}

		if (getBackground) {
			getBackground
				.then(function (src) {
					body.setStyle({backgroundImage: 'url(' + src + ')'});
				});
		}
	},

	updateBodyContent: function (content, masked, whiteMask) {
		var body = Ext.getBody(),
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

		if (whiteMask) {
			body.addCls('white-shade-mask');
		} else {
			body.removeCls('white-shade-mask');
		}
	},

	getObjectRoute: function (obj) {
		var me = this,
			id = obj.getId && obj.getId();

		id = id && encodeForURI(id);

		return me.PathActions.getPathToObject(obj)
			.then(function (path) {
				path.push(obj);

				return path;
			})
			.then(me.getRouteForPath.bind(me))
			.then(function (route) {
				var path = route.path;

				if (me.WindowActions.hasWindow(obj)) {
					path = Globals.trimRoute(path) + '/object/' + id;
				}

				return path;
			})
			.catch(function (reason) {
				console.error(('Unable to find path for: ', obj, reason));
				return {
					title: 'Library',
					route: '/library'
				};
			});
	},

	getRouteForPath: function (path) {
		var root = path && path[0],
			subPath = path && path.slice(1),
			route;

		if (root && root.isCourse) {
			route = this.getRouteForCourse(root, subPath);
		} else if (root instanceof ContentPackage) {
			route = this.getRouteForBundle(ContentBundle.fromPackage(root), subPath);
		} else if (root instanceof ContentBundle) {
			route = this.getRouteForBundle(root, subPath);
		} else if (root instanceof User) {
			route = this.getRouteForUser(root, subPath);
		} else if (root instanceof Community) {
			route = this.getRouteForCommunity(root, subPath);
		} else if (root instanceof DynamicFriendsList) {
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

	getRouteForCourse: function (course, path) {
		var cmp = this.getCmp('course-view-container'),
			route = cmp.getRouteForPath && cmp.getRouteForPath(path, course),
			id = course.getId();

		id = encodeForURI(id);

		route.path = Globals.trimRoute(route.path);

		route.path = '/course/' + id + '/' + route.path;

		return route;
	},

	getRouteForUser: function (user, path) {
		var cmp = this.getCmp('profile-user', 'profile-user(true)'),
			route = cmp.getRouteForPath && cmp.getRouteForPath(path, user),
			id = user.getId();

		route.path = Globals.trimRoute(route.path);
		route.path = '/user/' + id + '/' + route.path;

		return route;
	},

	getRouteForCommunity: function (community, path) {
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

	getRouteForGroup: function (group, path) {
		var cmp = this.getCmp('profile-group'),
			route, id = group.getId();

		id = encodeForURI(id);

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

	getRouteForBundle: function (bundle, path) {
		var cmp = this.getCmp('bundle-view-container'),
			route, id = bundle.get('NTIID');

		id = encodeForURI(id);

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
