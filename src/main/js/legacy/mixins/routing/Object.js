const Ext = require('@nti/extjs');

module.exports = exports = Ext.define('NextThought.mixins.routing.Object', {
	initRouter: function () {
		this.__mimeMap = {};
	},

	/**
	 * Add a handler for getting the route of an object that has the MimeType
	 *
	 * The handler takes the object we are trying to get the route for
	 * The handler can either return either a Promise that fulfills with the value or a value itself.
	 * If the handler determines it can't handle the object it should return a rejected Promise.
	 *
	 * The value can either be a string which is the route or an object that has:
	 *
	 * route:String //The route to navigate to for this object
	 * title:String //The title of the route
	 * precache:Object //A map of keys to objects that is passed to the routes handler
	 *					//so it doesn't have to redo all the work to get the objects
	 *
	 * @param {string|Array} mimeTypes MimeType or list of MimeTypes to use the handler for
	 * @param {Function} handler   function to handle mime types
	 * @returns {void}
	 */
	addObjectHandler: function (mimeTypes, handler) {
		if (!(mimeTypes instanceof Array)) {
			mimeTypes = [mimeTypes];
		}

		if (!this.__mimeMap) {
			this.__mimeMap = {};
		}

		var map = this.__mimeMap;

		(mimeTypes || []).forEach(function (mimeType) {
			if (map[mimeType]) {
				throw new Error('MimeType collision' + mimeType);
			} else {
				map[mimeType] = handler;
			}
		});
	},

	addDefaultObjectHandler: function (handler) {
		this.defaultObjectHandler = handler;
	},

	/**
	 * Given an object return the mime type
	 *
	 * @param  {Object|string} object --
	 * @returns {string}		  object's mime type
	 */
	__getMimeType: function (object) {
		if (typeof object === 'string') {
			return object;
		}

		return (
			(object.get && object.get('MimeType')) ||
			object.mimeType ||
			(object.self && object.self.mimeType)
		);
	},

	/**
	 * Given an object (or mime type) return a Promise that is the return value of the handler
	 *
	 * @param  {Object|string} objectOrMimeType thing to handle
	 * @returns {Promise}				  fulfills with handler's return
	 */
	handleObject: async function (objectOrMimeType) {
		var object =
				typeof objectOrMimeType === 'string' ? null : objectOrMimeType,
			mimeType = this.__getMimeType(objectOrMimeType),
			val;

		if (mimeType && this.__mimeMap && this.__mimeMap[mimeType]) {
			val = this.__mimeMap[mimeType].call(null, object);
		} else if (this.defaultObjectHandler) {
			val = this.defaultObjectHandler(object);
		} else {
			throw new Error('Fallback: No Object');
		}

		return val;
	},

	/**
	 * Return the route needed to navigate to through the items in the path array
	 * ex: [Course, Forum, Topic];
	 *
	 * returns an object with:
	 *
	 * path: String, //route itself
	 * isFull: Boolean //True if we were able to get full route for the path
	 *					//false if we were only able to get part way
	 * isAccessible: Boolean //!== false if we have access to this route
	 *							// === false if we don't
	 *
	 * @override
	 * @param {Array} path array of objects to navigate to, top down
	 * @param {Object} root the object that would be set as my root for the path
	 * @returns {Object} the route route to navigate to
	 */
	getRouteForPath: function (path, root) {
		return {
			path: '',
			isFull: false,
			isAccessible: false,
		};
	},
});
