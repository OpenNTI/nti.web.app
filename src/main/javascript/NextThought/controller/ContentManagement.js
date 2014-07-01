Ext.define('NextThought.controller.ContentManagement', {
	extend: 'Ext.app.Controller',

	models: [
		'ContentBundle'
	],


	stores: [
		'ContentBundles',
		'ContentPackages'
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
		store.proxy.url = getURL(source);
		if (Ext.isEmpty(source)) {
			store.load = function() { this.fireEvent('load', this, []); };
		}
		return store;
	}
});
