const Ext = require('@nti/extjs');
const { encodeForURI, isNTIID } = require('@nti/lib-ntiids');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

const WindowsStateStore = require('./StateStore');

require('internal/legacy/common/Actions');

module.exports = exports = Ext.define('NextThought.app.windows.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.WindowStore = WindowsStateStore.getInstance();
	},

	__resolveBeforeShow: function (ntiid) {
		let resolve;

		if (lazy.ParseUtils.isNTIID(ntiid)) {
			resolve = Service.getObject(ntiid);
		} else if (ntiid.indexOf('uri:') === 0) {
			resolve = Service.request(ntiid.replace(/^uri:/, '')).then(
				resp => lazy.ParseUtils.parseItems(resp)[0]
			);
		} else {
			resolve = Promise.resolve(ntiid);
		}

		return resolve;
	},

	hasWindow: function (obj) {
		return this.WindowStore.hasComponentForMimeType(obj.mimeType);
	},

	/**
	 * Given an object return the object url
	 *
	 * TODO: unify this with the building of the url in Body.js
	 *
	 * @param  {Model} obj model to get url for
	 * @returns {string}		the url
	 */
	getRouteForObject: function (obj) {
		var id = obj.getId(),
			mimeType = obj.mimeType;

		id = isNTIID(id) ? encodeForURI(id) : encodeURIComponent(id);

		if (obj.addMimeTypeToRoute) {
			return '/object/' + encodeURIComponent(mimeType) + '/' + id;
		}

		return '/object/' + id;
	},

	pushWindow: function (objectOrNTIID, state, el, monitors, precache) {
		var id = objectOrNTIID,
			mimeType;

		if (typeof objectOrNTIID !== 'string') {
			id = objectOrNTIID.getId();
		}

		if (objectOrNTIID.isModel) {
			this.WindowStore.cacheObject(
				id,
				objectOrNTIID,
				el,
				monitors,
				precache
			);

			if (objectOrNTIID.addMimeTypeToRoute) {
				mimeType = objectOrNTIID.mimeType;
			}
		} else {
			this.WindowStore.cacheObject(id, null, el, monitors, precache);
		}

		this.WindowStore.firePushWindow(id, mimeType, state);
	},

	closeWindow: function () {
		this.WindowStore.firePushWindow(null);
	},

	closeActiveWindow: function () {
		this.WindowStore.fireCloseWindow();
	},

	showWindow: function (objectOrNTIID, state, el, monitors, precache) {
		var me = this,
			id,
			cache,
			fetchObject;

		if (typeof objectOrNTIID !== 'string') {
			id = objectOrNTIID.getId();
		} else {
			id = objectOrNTIID;
		}

		cache = this.WindowStore.getObject(id);

		if (cache) {
			objectOrNTIID = cache.obj || objectOrNTIID;
			el = el || cache.el;
			monitors = monitors || cache.monitors;
			precache = precache || cache.precache;
		}

		if (typeof objectOrNTIID === 'string') {
			fetchObject = this.__resolveBeforeShow(objectOrNTIID);
		} else {
			fetchObject = Promise.resolve(objectOrNTIID);
		}

		return fetchObject
			.then(function (result) {
				me.WindowStore.removeCache(id);
				me.WindowStore.fireShowWindow(
					result,
					state,
					el,
					monitors,
					precache
				);
			})
			.catch(function (error) {
				me.WindowStore.fireShowWindow(
					error,
					state,
					el,
					monitors,
					precache
				);
			});
	},

	showWindowWithMimeType: function (id, mimeType, state, rawId) {
		var me = this,
			resolver = me.WindowStore.getResolverFor(mimeType);

		if (!resolver) {
			me.showWindow(id, state);
			return;
		}

		resolver(id, rawId)
			.then(function (result) {
				me.WindowStore.fireShowWindow(result, state);
			})
			.catch(function (error) {
				me.WindowStore.fireShowWindow(error);
			});
	},
});
