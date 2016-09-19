const Ext = require('extjs');
const Globals = require('legacy/util/Globals');
const ParseUtils = require('legacy/util/Parsing');
const ContextStateStore = require('legacy/app/context/StateStore');
const PathStateStore = require('./StateStore');
require('legacy/common/Actions');
require('./parts/Assignment');
require('./parts/Content');
require('./parts/Forums');
require('./parts/Profiles');


module.exports = exports = Ext.define('NextThought.app.navigation.path.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.PathStore = PathStateStore.getInstance();
		this.ContextStore = ContextStateStore.getInstance();

		this.buildHandlerMap();
	},

	clearCache: function () {
		this.PathStore.clearCache();
	},

	buildHandlerMap: function () {
		var parts = NextThought.app.navigation.path.parts,
			keys = Object.keys(parts), handlers = {};

		keys.forEach(function (key) {
			var part = parts[key].create();

			if (part.addHandlers) {
				handlers = part.addHandlers(handlers);
			}
		});

		this.mimeToHandlers = handlers;
	},

	__doNTIIDRequest: function (ntiid, bundle) {
		var link = Service.getPathToObjectLink(ntiid);

		if (!link) {
			return Promise.reject('Failed to build path link');
		}

		return this.__doRequestForLink(link, bundle);
	},

	/**
	 * Given an object, built the link to get its path, call it, and fulfill with the path
	 *
	 * @param  {Object} obj object to get the link for
	 * @return {Promise}	fulfills with the path
	 */
	__doRequestForNoLink: function (obj) {
		//try the container id since its more liable to be cached
		const containerId = obj && obj.get && obj.get('ContainerId');
		const id = containerId || obj && obj.get && obj.get('NTIID');
		const link = Service.getPathToObjectLink(id);

		if (!link) {
			return Promise.reject('Failed to build path link');
		}

		return this.__doRequestForLink(link)
			.then(function (path) {
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
	 * @param  {String} link - url
	 * @param  {Object} bundle (optional) -- needed in multipackage content
	 * @return {Promise}	  fulfills with the path
	 */
	__doRequestForLink: function (link, bundle) {
		// To make it easy to handle content from a multipackage course,
		// when we cache, we will combine the link and bundle id.
		// This will help to avoid resolving to the wrong path.
		// Or getting a cached object from a different "sibling" bundle.
		const customLink = bundle ? link + bundle.getId() : link;
		let cache = this.PathStore.getFromCache(customLink);

		if (cache) {
			return cache;
		}

		cache = Service.request(link)
			.then(function (response) {
				var json = JSON.parse(response);

				if (bundle && bundle.isBundle) {
					const path = json.find((item) => {
						return item[0] && item[0].NTIID === bundle.getId();
					});
					return ParseUtils.parseItems(path || json[0]);
				}
				else {
					return ParseUtils.parseItems(json[0]);
				}
			});

		cache.catch(this.PathStore.removeFromCache.bind(this.PathStore, customLink));

		return this.PathStore.setInCache(customLink, cache);
	},

	__doHandledRequest: function (obj, handler) {
		var id = obj.getId(),
			cache = this.PathStore.getFromCache(id),
			doNotCache = Ext.isObject(handler) && handler.doNotCache,
			fn = Ext.isObject(handler) ? handler.fn : handler;

		if (cache) {
			return cache;
		}

		if (doNotCache) {
			return fn.call(null, obj, this.getPathToObject.bind(this));
		}

		cache = fn.call(null, obj, this.getPathToObject.bind(this));

		cache.catch(this.PathStore.removeFromCache.bind(this.PathStore, id));

		return this.PathStore.setInCache(id, cache);
	},


	__getHandlerForObj (obj) {
		let mimeTypes = obj.mimeType || obj;

		if (!Array.isArray(mimeTypes)) {
			mimeTypes = [mimeTypes];
		}

		for (let mimeType of mimeTypes) {
			if (this.mimeToHandlers[mimeType]) {
				return this.mimeToHandlers[mimeType];
			}
		}
	},

	/**
	 * Given an object (ntiid), return an array of objects that make up the path
	 * to it.
	 *
	 * if the object has a LibraryPath link on it use it, otherwise
	 * attempt to build a link using the Service doc
	 *
	 * @param  {Object|String} obj the object to get the path to
	 * @param {Object} bundle - course
	 * @return {Promise}	fulfills with the path to the object
	 */
	getPathToObject: function (obj, bundle) {
		var link = obj.getLink && obj.getLink('LibraryPath'),
			handler = this.__getHandlerForObj(obj),
			request;

		if (typeof obj === 'string') {
			request = this.__doNTIIDRequest(obj, bundle);
		} else if (handler) {
			request = this.__doHandledRequest(obj, handler);
		} else if (link) {
			request = this.__doRequestForLink(link, bundle);
		} else {
			request = this.__doRequestForNoLink(obj);
		}

		return request.then(function (path) {
			path = path || [];

			return path.slice();
		});
	},

	/**
	 * Given a path return the root bundle in it
	 *
	 * @param {Array} path the path to get the bundle out of
	 * @return {Object} the root bundle in the path
	 */
	getRootBundleFromPath (path) {
		for (let part of path) {
			if (part.isBundle) {
				return part;
			}
		}
	},

	__resolveForbiddenBreadCrumb: function (resp) {
		var json = Globals.parseJSON(resp, true),
			items = json && json.Items,
			obj = items && items[0];

		obj = obj && ParseUtils.parseItems(obj)[0];

		if (obj && obj.getTitle) {
			return [{
				label: obj.getTitle(true)
			}];
		}

		return Promise.reject();
	},

	getBreadCrumb: function (record) {
		const me = this;
		const rootObject = me.ContextStore.getRootBundle() || me.ContextStore.getRootProfile();

		//Get the path for the record
		return me.getPathToObject(record, rootObject)
			.then(function (path) {
				var i, titles = [], item;

				//if the first path item is the root bundle, take it off
				if ((path && rootObject) && path[0].getId() === rootObject.getId()) {
					path.shift();
				}

				for (i = 0; i < path.length; i++) {
					item = path[i];

					if (item.getTitle && item.getTitle() !== '') {
						titles.push({
							label: item.getTitle(),
							ntiid: item.getId()
						});
					}

					if (item.shouldBeRoot && item.shouldBeRoot()) {
						break;
					}
				}

				return titles;
			})
			.catch(function () {
				//if we fail to get the path to the item, try to get the container
				//and show its title
				var containerId = record && record.get('ContainerId');

				if (!containerId) {
					return Promise.reject();
				}

				return Service.getObject(containerId)
					.then(function (container) {
						if (container.getTitle) {
							return [{
								label: container.getTitle()
							}];
						}

						return Promise.reject();
					})
					.catch(function (reason) {
						//If the container fails, check if it 403s. If it did
						//the response text should be an object the user needs
						//to gain access to, so show it in the breadcrumb
						var resp = Array.isArray(reason) ? reason[1] : null;

						if (resp && resp.status === 403) {
							return me.__resolveForbiddenBreadCrumb(resp.responseText);
						}

						return Promise.reject();
					});
			});
	}
});
