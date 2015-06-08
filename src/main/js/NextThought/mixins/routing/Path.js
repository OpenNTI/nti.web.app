/*
	Inspired by https://github.com/chrisdavies/rlite/blob/master/rlite.js
 */
Ext.define('NextThought.mixins.routing.Path', {
	VARIABLE_KEY: '@var',

	/*
		A map of the parts of a route to a handler
		{
			root: {
				sub1: { handler: fn1 }
				sub2: {
					sub2-1: {handler: fn2 }
					@var: {
						varName: 'test'
						varSub: {handler: fn3 }
						handler: fn4
					}
				}
			}
		}

		so:

		'root/sub1/' will be handled by fn1
		'root/sub2/sub2-1/' will be handled by fn2
		'root/sub2/var/' will be handled by fn4 passed test = var as params
		'root/sub2/var/varSub' will be handled by fn4 passed test = var as params
	 */
	initRouter: function() {
		this.__routeMap = this.__routeMap || {};
	},


	trimRoute: function(route) {
		return Globals.trimRoute(route);
	},


	/**
	 * Add a handler for a route to the route map
	 *
	 * handler should return its part of the current url
	 * the handler can return a promise
	 *
	 * @param {String} route   the path to add the handler to
	 * @param {Function} handler the handler
	 */
	addRoute: function(route, handler) {
		route = this.trimRoute(route);

		var parts = route.split('/'),
			varKey = this.VARIABLE_KEY,
			root, sub;

		root = parts[0];

		if (root[0] === ':' && parts.length === 1) {
			this.__routeMap[varKey] = {};
			this.__routeMap[varKey].handler = handler;
			this.__routeMap[varKey].varName = root.slice(1);
			return;
		}


		//remove the roots from the part
		parts = parts.slice(1);

		if (root === '') {
			root = '/';
		}

		if (!this.__routeMap) {
			this.__routeMap = {};
		}

		root = root.toLowerCase();


		if (root[0] === ':') {
			if (!this.__routeMap[varKey]) {
				root = this.__routeMap[varKey] = {
					varName: root.slice(1)
				};
			} else {
				root = this.__routeMap[varKey];
			}
		} else {
			if (!this.__routeMap[root]) {
				root = this.__routeMap[root] = {};
			} else {
				root = this.__routeMap[root];
			}
		}

		sub = root;

		//add or get the sub route for key
		function addPart(s, key) {
			s = s[key] = s[key] || {};

			return s;
		}

		//add or get the variable for sub route
		function addVariablePart(s, name) {
			var key = varKey;

			s = addPart(s, key);
			//remove the : from the front of the name
			s.varName = name.slice(1);

			return s;
		}

		//for each part of the url add a sub route
		parts.forEach(function(part) {
			var key = part.toLowerCase();

			//if the key starts with a : add it as a variable sub route
			//otherwise add it as a regular sub route
			sub = key[0] === ':' ? addVariablePart(sub, key) : addPart(sub, key);
		});

		//if the sub route already has a handler throw an error
		if (sub.handler) {
			console.error('Route collision', route);
			throw 'Route Collision';
		} else {
			sub.handler = handler;
		}
	},


	/**
	 * Add a default handler for unknown paths
	 *
	 * handler should return its part of the url, or a string to use as the route
	 * the handler can return a promise
	 * @param {Function|String} handler
	 */
	addDefaultRoute: function(handler) {
		if (typeof handler === 'string') {
			this.defaultRoutePath = handler;
		} else {
			this.defaultRouteHandler = handler;
		}
	},


	/**
	 * Given a route call a handler if we have one for it
	 * @param  {String} route
	 * @param {Object} precached a map of keys to precached objects
	 * @return {Promise} fulfills with the return value of the handler
	 */
	handleRoute: function(route, precache) {
		route = this.trimRoute(route);

		var parts = route.split('/'),
			varKey = this.VARIABLE_KEY,
			params = {}, subRoute,
			currentRoute = '',
			sub, i, key, val;

		precache = precache || {};

		sub = this.__routeMap;

		//for each part in the url
		for (i = 0; i < parts.length; i++) {
			key = parts[i].toLowerCase();

			if (key === '') { key = '/'; }

			//if the sub route has a key use that sub route
			if (sub[key]) {
				sub = sub[key];
			//else is the sub route has a variable sub route and the part is not empty
			//add the part to the params and use that sub route
			} else if (sub[varKey] && parts[i]) {
				params[sub[varKey].varName] = parts[i];
				sub = sub[varKey];
			//otherwise stop looking at the parts
			} else {
				break;
			}

			currentRoute = currentRoute + '/' + key;
		}

		//add the remaining parts as sub route
		subRoute = parts.slice(i).join('/');

		this.currentRoute = currentRoute;

		//if the sub route has a handler call it
		if (sub.handler) {
			val = sub.handler.call(null, {
				path: '/' + route,
				params: params,
				precache: precache
			}, '/' + subRoute);
		//if there is no handler but we have a default handler call that
		} else if (this.defaultRouteHandler) {
			val = this.defaultRouteHandler.call(null, {
				path: '/' + route,
				precache: precache
			});
		} else if (this.defaultRoutePath) {
			val = this.handleRoute(this.defaultRoutePath, precache);
		} else {
			console.warn('No Handler for route', route);
		}

		if (!(val instanceof Promise)) {
		 	val = Promise.resolve(val);
		}

		val.then(this.afterRoute.bind(this));

		return val;
	},


	afterRoute: function() {},


	getCurrentRoute: function() {
		return this.currentRoute;
	},


	addChildRouter: function(cmp) {
		if (!cmp.pushRoute) {
			console.error('Cant set a non route cmp as a child router router');
			return;
		}

		var key = cmp.state_key || cmp.xtype,
			state = this.getRouteState() || {};

		cmp.pushRoute = this.__pushChildRoute.bind(this);
		cmp.replaceRoute = this.__replaceChildRoute.bind(this);
		cmp.pushRootRoute = this.pushRootRoute.bind(this);
		cmp.replaceRootRoute = this.replaceRootRoute.bind(this);
		cmp.pushRouteState = this.__pushChildState.bind(this, key);
		cmp.replaceRouteState = this.__replaceChildState.bind(this, key);
		cmp.getRouteState = this.__getChildState.bind(this, key);
		cmp.setTitle = this.__setChildTitle.bind(this);

		if (cmp.onAddedToParentRouter) {
			cmp.onAddedToParentRouter(this);
		}
	},

	/**
	 * Return a title to put in the history.pushState title for this route
	 * @override
	 * @return {String} a title to describe the state of this route
	 */
	getRouteTitle: function() { return ''; },

	/**
	 * Return objects to apply to the cache to speed up handling a route
	 * @return {Object} items to merge into the precache
	 */
	getRoutePrecache: function() { return {}; },


	getRouteState: function() {
		var key = this.state_key || this.xtype;

		return (history.state || {})[key] || {};
	},


	__getChildState: function(key) {
		var state = this.getRouteState() || {};

		return state[key] || {};
	},


	/**
	 * Merge a title and sub route into mine
	 *
	 * @param  {String} title
	 * @param  {String} subRoute
	 * @return {Object}           map of the values
	 */
	__mergeChildRoute: function(title, subRoute, precache) {
		var myTitle = this.getRouteTitle(),
			route = this.getCurrentRoute(),
			myCache = this.getRoutePrecache();

		if (myTitle && title) {
			title = title + ' - ' + myTitle;
		} else if (!title) {
			title = myTitle;
		}

		if (myCache && precache) {
			precache = Ext.apply(myCache, precache);
		} else if (!precache) {
			precache = myCache;
		}

		route = this.trimRoute(route);
		subRoute = this.trimRoute(subRoute);

		route = route + '/' + subRoute;

		return {
			title: title,
			route: route,
			precache: precache
		};
	},


	__doRoute: function(fn, title, subRoute, precache) {
		var merged = this.__mergeChildRoute(title, subRoute, precache);


		if (this[fn]) {
			this[fn](merged.title, merged.route, merged.precache);
		} else {
			console.error('No fn to do route', fn);
		}
	},


	/**
	 * Merge the child's route with mine and push it
	 * @param  {String} title    title of the route
	 * @param  {String} subRoute the childs route
	 * @param {Object} precache a map of keys to object to prevent resolving them more than once
	 */
	__pushChildRoute: function(title, subRoute, precache) {
		this.__doRoute('pushRoute', title, subRoute, precache);
	},


	/**
	 * Merge the childs route with mine and replace it
	 * @param  {String} title    title of the route
	 * @param  {String} subRoute the childs route
	 * @param {Object} precache a map of keys to object to prevent resolving them more than once
	 */
	__replaceChildRoute: function(title, subRoute, precache) {
		this.__doRoute('replaceRoute', title, subRoute, precache);
	},


	__doState: function(fn, key, obj, title, subRoute, precache) {
		var merged = this.__mergeChildRoute(title, subRoute, precache);

		this.history_state = this.getRouteState();

		this.history_state[key] = obj;

		if (this[fn]) {
			this[fn](this.history_state, merged.title, merged.route, merged.precache);
		} else {
			console.error('No fn to change state', fn);
		}
	},


	/**
	 * Merge the childs route with mine and push it
	 * @param {String} key key of the cmp
	 * @param {Object} obj state object
	 * @param  {String} title    title of the route
	 * @param  {String} subRoute the childs route
	 * @param {Object} precache a map of keys to object to prevent resolving them more than once
	 */
	__pushChildState: function(key, obj, title, subRoute, precache) {
		this.__doState('pushRouteState', key, obj, title, subRoute, precache);
	},


	/**
	 * Merge the childs route with mine and replace it
	 * @param {String} key the key of the cmp
	 * @param {Object} obj state object
	 * @param  {String} title    title of the route
	 * @param  {String} subRoute the childs route
	 * @param {Object} precache a map of keys to object to prevent resolving them more than once
	 */
	__replaceChildState: function(key, obj, title, subRoute, precache) {
		this.__doState('replaceRouteState', key, obj, title, subRoute, precache);
	},


	/**
	 * Merge my title in to the childs and set it
	 * @param {String} title title to set on the document
	 */
	__setChildTitle: function(title) {
		var myTitle = this.getRouteTitle();

		if (myTitle && title) {
			title = title + ' - ' + myTitle;
		} else if (!title) {
			title = myTitle;
		}

		this.setTitle(title);
	},

	/**
	 * Set the title of the document
	 * @param {String} title title to set on the document
	 */
	setTitle: function(title) {},

	/**
	 * Push a current route
	 * @override
	 * @param  {String} title the title to set on the document
	 * @param  {String} route   the route to set
	 * @param {Object} precache a map of keys to object to prevent resolving them more than once
	 */
	pushRoute: function(title, route, precache) {},


	/**
	 * Replace the current route
	 * @override
	 * @param  {String} title the title to set on the document
	 * @param  {String} route   the route to replace with
	 * @param {Object} precache a map of keys to object to prevent resolving them more than once
	 */
	replaceRoute: function(title, route, precache) {},


	/**
	 * Skips all the route building and sets it on the root
	 * @override
	 * @param  {String} title the title to set on the document
	 * @param  {String} route   the route to set
	 * @param {Object} precache a map of keys to object to prevent resolving them more than once
	 */
	pushRootRoute: function(title, route, precache) {},


	/**
	 * Skips all the route building and sets it on the root
	 * @override
	 * @param  {String} title the title to set on the document
	 * @param  {String} route   the route to set
	 * @param {Object} precache a map of keys to object to prevent resolving them more than once
	 */
	replaceRootRoute: function(title, route, precache) {},


	/**
	 * Push a state object to the history
	 * @param  {Object} obj      state object to push
	 * @param  {String} title    title of the state
	 * @param  {String} route    route for the state
	 * @param  {Object} precache a map of keys to prevent resolving them more than once
	 */
	pushRouteState: function(obj, title, route, precache) {},

	/**
	 * Push a state object to the history
	 * @param  {Object} obj      state object to push
	 * @param  {String} title    title of the state
	 * @param  {String} route    route for the state
	 * @param  {Object} precache a map of keys to prevent resolving them more than once
	 */
	replaceRouteState: function(obj, title, route, precache) {},


	/**
	 * Whether or not we need to stop route change before we go any further
	 * can return a boolean or a promise if we need to confirm with the user first
	 * @override
	 * @return {Boolean|Promise} if we can navigate
	 */
	allowNavigation: function() { return true; }
});
