Ext.define('NextThought.controller.ContentManagement', {
	extend: 'Ext.app.Controller',

	models: [
		'ContentBundle'
	],


	stores: [
		'ContentBundles'
	],


	init: function() {
		this.application.on('session-ready', 'onSessionReady', this);
	},

	onSessionReady: function() {
		var store = this.__setupStore('ContentBundles', (Service.getCollection('VisibleContentBundles', 'ContentBundles') || {}).href);

		if (store) {
			store.load();
		}
	},


	__setupStore: function(storeId, source) {
		var store = Ext.getStore(storeId);
		if (Ext.isEmpty(source)) {
			console.warn('ContentManagement: Not setting up store: ' + storeId + ', no source given');
			store.destroy();
			return null;
		}
		store.proxy.url = getURL(source);
		return store;
	}
});
