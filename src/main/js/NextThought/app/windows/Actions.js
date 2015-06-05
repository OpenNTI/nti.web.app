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


	/**
	 * Given an object or NTIID show a modal for it
	 *
	 *
	 * @param  {String|Model} objectOrNTIID the object or ntiid of the object to show
	 * @param  {Array} path       the path to show for the modal, or a promise that fulfills with the path
	 * @return {Promise}          fulfills when the window is open
	 */
	showWindow: function(objectOrNTIID, path, el) {
		var me = this,
			fetchObject;

		if (typeof objectOrNTIID === 'string') {
			fetchObject = this.__resolveBeforeShow(objectOrNTIID)
				.then(function(object) {
					me.showModal(object, context);
				});
		} else {
			fetchObject = objectOrNTIID;
		}


		return Promise.all([
				fetchObject,
				path
			]).then(function(results) {
				me.WindowStore.fireShowWindow(results[0], results[1], el);
			});
	}
});
