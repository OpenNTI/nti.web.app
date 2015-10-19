Ext.define('NextThought.app.navigation.path.StateStore', {
	extend: 'NextThought.common.StateStore',

	CONTAINER_PATH: {},

	getFromCache: function(ntiid) {
		return this.CONTAINER_PATH[ntiid];
	},


	setInCache: function(ntiid, pathPromise) {
		this.CONTAINER_PATH[ntiid] = pathPromise;

		return pathPromise;
	},


	removeFromCache: function(ntiid) {
		delete this.CONTAINER_PATH[ntiid];
	},


	clearCache: function() {
		this.CONTAINER_PATH = {};
	}

});
