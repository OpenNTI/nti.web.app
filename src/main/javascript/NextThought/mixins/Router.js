/*
	Inspired by https://github.com/chrisdavies/rlite/blob/master/rlite.js
 */
Ext.define('NextThought.mixins.Router', {
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
	__routeMap: {},

	trimRoute: function(route) {
		//get rid of any leading slash
		route = route.replace(/^\//, '');
		//get rid of any trailing slash
		route = route.replace(/\/$/, '');

		return route;
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

		//remove the roots from the part
		parts = parts.slice(1);

		if (!root) {
			console.error('Invalid Route:', route);
			throw 'Invalid Route';
		}

		root = root.toLowerCase();

		if (!this.__routeMap[root]) {
			root = this.__routeMap[root] = {};
		} else {
			root = this.__routeMap[root];
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
	 * handler should return its part of the url
	 * the handler can return a promise
	 * @param {Function} handler
	 */
	addDefaultRoute: function(handler) {
		this.defaultRouteHandler = handler;
	},


	/**
	 * Given a route call a handler if we have one for it
	 * @param  {String} route
	 * @return {Promise} fulfills with the return value of the handler
	 */
	handleRoute: function(route) {
		route = this.trimRoute(route);

		var parts = route.split('/'),
			varKey = this.VARIABLE_KEY,
			params = {}, subRoute,
			sub, i, key, val;

		sub = this.__routeMap;

		//for each part in the url
		for (i = 0; i < parts.length; i++) {
			key = parts[i].toLowerCase();

			//if the sub route has a key use that sub route
			if (sub[key]) {
				sub = sub[key];
			//else is the sub route has a variable sub route
			//add the part to the params and use that sub route
			} else if (sub[varKey]) {
				params[sub[varKey].varName] = parts[i];
				sub = sub[varKey];
			//otherwise stop looking at the parts
			} else {
				break;
			}
		}

		//add the remaining parts as sub route
		subRoute = parts.slice(i).join('/');

		//if the sub route has a handler call it
		if (sub.handler) {
			val = sub.handler.call(null, {
				path: '/' + route,
				params: params
			}, '/' + subRoute);
		//if there is no handler but we have a default handler call that
		} else if (this.defaultRouteHandler) {
			val = this.defaultRouteHandler.call(null, {
				path: '/' + route
			});
		} else {
			console.warn('No Handler for route', route);
		}

		if (val instanceof Promise) {
			return val;
		}

		return Promise.resolve(val);
	}
});
