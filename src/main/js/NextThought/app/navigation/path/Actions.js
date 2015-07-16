Ext.define('NextThought.app.navigation.path.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.navigation.path.StateStore',
		'NextThought.app.navigation.path.parts.Assignment',
		'NextThought.app.navigation.path.parts.Content',
		'NextThought.app.context.StateStore',
		'NextThought.app.navigation.path.parts.Forums',
		'NextThought.app.navigation.path.parts.Profiles'
	],


	constructor: function() {
		this.callParent(arguments);

		this.PathStore = NextThought.app.navigation.path.StateStore.getInstance();
		this.ContextStore = NextThought.app.context.StateStore.getInstance();

		this.buildHandlerMap();
	},


	buildHandlerMap: function() {
		var parts = NextThought.app.navigation.path.parts,
			keys = Object.keys(parts), handlers = {};

		keys.forEach(function(key) {
			var part = parts[key].create();

			if (part.addHandlers) {
				handlers = part.addHandlers(handlers);
			}
		});

		this.mimeToHandlers = handlers;
	},


	__doNTIIDRequest: function(ntiid) {
		var link = Service.getPathToObjectLink(ntiid);

		if (!link) {
			return Promise.reject('Failed to build path link');
		}

		return this.__doRequestForLink(link);
	},


	/**
	 * Given an object, built the link to get its path, call it, and fulfill with the path
	 *
	 * @param  {Object} obj object to get the link for
	 * @return {Promise}    fulfills with the path
	 */
	__doRequestForNoLink: function(obj) {
		var url = Service.getPathToObjectLink(),
			//try the container id since its more liable to be cached
			containerId = obj.get('ContainerId'),
			id = containerId || obj.get('NTIID'),
			link = Service.getPathToObjectLink(id);

		if (!link) {
			return Promise.reject('Failed to build path link');
		}

		return this.__doRequestForLink(link)
			.then(function(path) {
				if (containerId) {
					path.push(obj);
				}

				return path;
			});
	},

	/**
	 * Given a link return the path it returns
	 *
	 * We are caching on the link, because this call will sometimes
	 * come from a user click and we need it to be as fast as possible
	 * so lets not chance the browser not caching it.
	 *
	 * @param  {String} link
	 * @return {Promise}      fulfills with the path
	 */
	__doRequestForLink: function(link) {
		var cache = this.PathStore.getFromCache(link);

		if (cache) {
			return cache;
		}

		cache = Service.request(link)
			.then(function(response) {
				var json = JSON.parse(response);

				//For now just return the first path in the list
				return ParseUtils.parseItems(json[0]);
			});

		cache.fail(this.PathStore.removeFromCache.bind(this.PathStore, id));

		return this.PathStore.setInCache(link, cache);
	},


	__doHandledRequest: function(obj, handler) {
		var id = obj.getId(),
			cache = this.PathStore.getFromCache(id);

		if (cache) {
			return cache;
		}

		cache = handler.call(null, obj, this.getPathToObject.bind(this));

		cache.fail(this.PathStore.removeFromCache.bind(this.PathStore, id));

		return this.PathStore.setInCache(id, cache);
	},

	/**
	 * Given an object (ntiid), return an array of objects that make up the path
	 * to it.
	 *
	 * if the object has a LibraryPath link on it use it, otherwise
	 * attempt to build a link using the Service doc
	 *
	 * @param  {Object|String} obj the object to get the path to
	 * @return {Promise}    fulfills with the path to the object
	 */
	getPathToObject: function(obj) {
		var link = obj.getLink && obj.getLink('LibraryPath'),
			handler = this.mimeToHandlers[obj.mimeType],
			request;

		if (typeof obj === 'string') {
			request = this.__doNTIIDRequest(obj);
		} else if (handler) {
			request = this.__doHandledRequest(obj, handler);
		} else if (link) {
			request = this.__doRequestForLink(link);
		} else {
			request = this.__doRequestForNoLink(obj);
		}

		return request.then(function(path) {
				return path.slice();
			});
	},

	getBreadCrumb: function(record) {
		var me = this,
			rootObject = me.ContextStore.getRootBundle() || me.ContextStore.getRootProfile(),
			path,
			title;

		//Get the path for the record
		return me.getPathToObject(record)
			.then(function(path) {
				//if the first path item is the root bundle, take it off
				if ((path && rootObject) && path[0].getId() == rootObject.getId()) {
					path.shift();
				}
				//map to item.getTitle && item.getTitle() | filter out empty
				title = path.map(function(item) {
					if (item.getTitle && item.getTitle() != '') {
						return {
							label: item.getTitle()
						};
					} else {
						return '';
					}
				});

				return title.filter(function(value) {
					return !!value;
				});
			})
			.fail(function(error) {
				console.error('Unable to get path because  ' + error);
			});
	}

});
