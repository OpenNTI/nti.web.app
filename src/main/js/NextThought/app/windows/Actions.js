Ext.define('NextThought.app.windows.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.windows.StateStore'
	],


	constructor: function() {
		this.callParent(arguments);

		this.WindowStore = NextThought.app.windows.StateStore.getInstance();
	},


	__resolveBeforeShow: function(ntiid) {
		return Service.getObject(ntiid);
	},


	hasWindow: function(obj) {
		return this.WindowStore.hasComponentForMimeType(obj.mimeType);
	},


	/**
	 * Push a window to the state
	 * @param  {String|Model} objectOrNTIID the object or ntiid of the object to show
	 * @param  {Array} path          the path to show for the model
	 * @param  {Element} el           element to show the note opening from
	 */
	pushWindow: function(objectOrNTIID, state, el, monitors, precache) {
		var id = objectOrNTIID;

		if (typeof objectOrNTIID !== 'string') {
			id = objectOrNTIID.getId();
		}

		if (objectOrNTIID.isModel) {
			this.WindowStore.cacheObject(id, objectOrNTIID, el, monitors, precache);
		}

		this.WindowStore.firePushWindow(id, state);
	},


	closeWindow: function() {
		this.WindowStore.firePushWindow(null);
	},


	closeActiveWindow: function() {
		this.WindowStore.fireCloseWindow();
	},


	/**
	 * Given an object or NTIID show a modal for it, without pushing or replacing state
	 *
	 *
	 * @param  {String|Model} objectOrNTIID the object or ntiid of the object to show
	 * @return {Promise}          fulfills when the window is open
	 */
	showWindow: function(objectOrNTIID, state, el, monitors, precache) {
		var me = this, id, cache,
			fetchObject;

		if (typeof objectOrNTIID !== 'string') {
			id = objectOrNTIID.getId();
		} else {
			id = objectOrNTIID;
		}

		cache = this.WindowStore.getObject(id);

		if (cache) {
			objectOrNTIID = cache.obj;
			el = el || cache.el;
			monitors = monitors || cache.monitors;
			precache = precache || cache.precache;
		}

		if (typeof objectOrNTIID === 'string' && ParseUtils.isNTIID(objectOrNTIID)) {
			fetchObject = this.__resolveBeforeShow(objectOrNTIID);
		} else {
			fetchObject = Promise.resolve(objectOrNTIID);
		}

		return fetchObject.then(function(result) {
			me.WindowStore.removeCache(id);
			me.WindowStore.fireShowWindow(result, state, el, monitors, precache);
		}).fail(function(error){
			me.WindowStore.fireShowWindow(error, state, el, monitors, precache);
		})
	}
});
