var Ext = require('extjs');
var Globals = require('../util/Globals');
var ParseUtils = require('../util/Parsing');
var RoutingPath = require('./routing/Path');
var RoutingObject = require('./routing/Object');
var PathActions = require('../app/navigation/path/Actions');
var WindowsActions = require('../app/windows/Actions');


module.exports = exports = Ext.define('NextThought.mixins.Router', {
    mixins: {
		Path: 'NextThought.mixins.routing.Path',
		Object: 'NextThought.mixins.routing.Object'
	},

    initRouter: function() {
		if (this.__routerInitialized) {
			return;
		}

		this.__routerInitialized = true;

		this.mixins.Path.initRouter.call(this);
		this.mixins.Object.initRouter.call(this);

		this.Router = {
			PathActions: NextThought.app.navigation.path.Actions.create(),
			WindowActions: NextThought.app.windows.Actions.create()
		};
	},

    addChildRouter: function(cmp) {
		cmp.__parentRouter = this;


		if (!this.Router) {
			this.initRouter();
		}

		if (!cmp.Route && cmp.initRouter) {
			cmp.initRouter();
		}

		//Add a reference to my parents root, or treat
		//my parent as the root
		cmp.Router.root = this.Router.root || this;

		this.mixins.Path.addChildRouter.call(this, cmp);
		// this.mixins.Object.addChildRouter.call(this, cmp);
	},

    __handleObjectNav: function(fragment, result) {
		result = result || {};

		if (typeof result === 'string') {
			result = {
				route: result
			};
		}

		if (fragment) {
			result.route = Globals.trimRoute(result.route) + '#' + fragment;
		}

		this.pushRoute(result.title || '', result.route, result.precache);
	},

    __handleObjectRoute: function(result) {
		result = result || {};

		if (typeof result === 'string') {
			result = {
				route: result
			};
		}

		this.replaceRoute(result.title || '', result.route, result.precache);
	},

    __handleNoObjectNavigation: function(object, fragment) {
		if (this.__parentRouter) {
			 return this.__parentRouter.navigateToObject(object, fragment);
		}
	},

    navigateToObject: function(object, fragment) {
		return this.mixins.Object.handleObject.call(this, object)
			.then(this.__handleObjectNav.bind(this, fragment))
			.fail(this.__handleNoObjectNavigation.bind(this, object, fragment));
	},

    /**
	 * Try to figure out the path to an object, and if we can get a full path navigate to it
	 * otherwise stay where you are and attempt to open the object as a window
	 *
	 * the monitors can be passed to override what we do in different cases, for now the only one
	 * we really need is a chance to override the on fail.
	 *
	 * {
	 * 	doNavigateToFullPath: Function
	 * 	onFailedToGetFullPath: Function
	 * }
	 *
	 * @param  {Object} obj   the thing to navigate to
	 * @param  {Object} monitors key val map of events to functions
	 */
	attemptToNavigateToObject: function(obj, monitors) {
		var me = this,
			objId = obj && obj.getId(),
			WindowStore = this.Router.WindowActions && this.Router.WindowActions.WindowStore,
			hasWindow = objId && this.Router.WindowActions.hasWindow(obj);

		monitors = monitors || {};

		monitors.doNavigateToFullPath = monitors.doNavigateToFullPath || me.doNavigateToFullPath.bind(me);
		monitors.onFailedToGetFullPath = monitors.onFailedToGetFullPath || me.onFailedToGetFullPath.bind(me);

		if (hasWindow && obj && obj.isModel) {
			WindowStore.cacheObject(obj.getId(), obj, null, monitors);
		}

		me.Router.PathActions.getPathToObject(obj)
			.then(function(path) {
				if (!me.Router.WindowActions.hasWindow(obj)) {
					path.push(obj);
				}

				return path;
			}, monitors.onFailedToGetFullPath.bind(null, obj))
			.then(me.getRouteForPath.bind(me))
			.then(function(route) {
				if (route.isFull && route.isAccessible !== false) {
					monitors.doNavigateToFullPath(obj, route);
				} else {
					monitors.onFailedToGetFullPath(obj, route);
				}
			});
	},

    attemptToNavigateToPath: function(path) {
		var route = this.getRouteForPath(path);

		if (route.isAccessible === false) {
			this.pushRootRoute('Library', '/library');
		} else {
			this.doNavigateToFullPath(null, route);
		}
	},

    doNavigateToFullPath: function(obj, route) {
		var path = route.path,
			objId = obj && obj.getId(),
			hasWindow = objId && this.Router.WindowActions.hasWindow(obj),
			windowRoute = hasWindow && this.Router.WindowActions.getRouteForObject(obj);

		objId = objId && ParseUtils.encodeForURI(objId);

		if (hasWindow) {
			path = Globals.trimRoute(path) + '/' + Globals.trimRoute(windowRoute);
		}

		this.pushRootRoute('', path);
	},

    onFailedToGetFullPath: function(obj, route) {
		this.WindowActions.pushWindow(obj);

		return Promise.reject();
	},

    __handleNoObjectRoute: function(object) {
		var me = this,
			children = me.__childRouters || [];

		Promise.first(children.map(function(child) {
			if (child.handleObject) {
				return child.handleObject(object);
			}

			return Promise.reject();
		})).then(me.__handleObjectRoute.bind(me))
			.fail(function() {
					me.replaceRootState('', '/');
			});
	},

    handleObject: function(object) {
		this.mixins.Object.handleObject.call(this, object)
			.then(this.__handleObjectRoute.bind(this))
			.then(this.__handleNoObjectRoute.bind(this, object));
	},

    /**
	 * Return the current context
	 * @override
	 * @return {Object|String}
	 */
	getContext: function() {},

    /**
	 * Returns an array of the current context the view is in
	 * @return {[type]} [description]
	 */
	getCurrentContext: function() {
		var me = this,
			context = [],
			currentRoute = me.getCurrentRoute(),
			currentTitle = me.getRouteTitle(),
			myContext = me.getContext(),
			child = me.getActiveItem(),
			childContext = child && child.getCurrentContext && child.getCurrentContext();

		function addContext(c) {
			if (Ext.isArray(c)) {
				context = context.concat(c);
			} else if (c) {
				context.push(c);
			}
		}

		if (!(myContext instanceof Promise)) {
			myContext = Promise.resolve(myContext);
		}

		if (!(childContext instanceof Promise)) {
			childContext = Promise.resolve(childContext);
		}

		return Promise.all([
				myContext,
				childContext
			]).then(function(results) {
				var my = {
					route: currentRoute,
					title: currentTitle,
					obj: results[0],
					cmp: me
				};

				addContext(my);
				addContext(results[1]);

				return context;
			});
	},

    /**
	 * Return the active cmp for this route
	 * @override
	 * @return {Object} the active cmp
	 */
	getActiveItem: function() {
		var layout = this.getLayout && this.getLayout(),
			item = layout && layout.getActiveItem && layout.getActiveItem();

		return item || {};
	},

    /**
	 * Whether or not we need to stop route change before we go any further
	 * can return a boolean or a promise if we need to confirm with the user first
	 * @override
	 * @return {Boolean|Promise} if we can navigate
	 */
	allowNavigation: function() {
		var activeItem = this.getActiveItem();

		return activeItem && activeItem.allowNavigation ? activeItem.allowNavigation() : true;
	},

    /**
	 * Before changing routes, go down the active route and call onDeactivate
	 * on any components that implement it. Handling it here is too late to
	 * stop the route from changing
	 */
	beforeRouteChange: function() {
		var activeItem = this.getActiveItem();

		if (activeItem && activeItem.onRouteDeactivate) {
			activeItem.onRouteDeactivate();
		}

		if (activeItem && activeItem.beforeRoute) {
			activeItem.beforeRouteChange();
		}
	}
});
