const Ext = require('@nti/extjs');
require('legacy/common/StateStore');


module.exports = exports = Ext.define('NextThought.app.navigation.path.StateStore', {
	extend: 'NextThought.common.StateStore',

	CONTAINER_PATH: {},

	getFromCache (ntiid) {
		return this.CONTAINER_PATH[ntiid];
	},


	setInCache (ntiid, pathPromise) {
		this.CONTAINER_PATH[ntiid] = pathPromise;

		return pathPromise;
	},


	removeFromCache (ntiid) {
		delete this.CONTAINER_PATH[ntiid];
	},


	clearCache () {
		this.CONTAINER_PATH = {};
	}

});
