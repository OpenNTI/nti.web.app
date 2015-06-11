Ext.define('NextThought.app.userdata.StateStore', {
	extend: 'NextThought.common.StateStore',

	getSocket: function() {
		if (!this.socket) {
			this.socket = Socket;
		}

		return this.socket;
	},


	setPreference: function(key, pref) {
		this.page_preference_map = this.page_preference_map || {};

		this.page_preference_map[key] = pref;
	},


	getPreference: function(key) {
		return this.page_preference_map && this.page_preference_map[key];
	},


	setContext: function(ctx) {
		this.currentContext = ctx;
	},


	clearContext: function() {
		delete this.currentContext;
	},


	getMainReaderContext: function() {
		return this.flatPageContextMap['main-reader-view'];
	},


	addStore: function(store) {
		if (!this.flatPageContextMap) {
			this.flatPageContextMap = {};
		}

		if (!this.flatPageContextMap.others) {
			this.flatPageContextMap.others = {
				currentPageStores: {}
			};
		}

		this.flatPageContextMap.others.currentPageStores[store.storeId] = store;
	},


	getContext: function(cmp) {
		if (!this.flatPageContextMap) {
			this.flatPageContextMap = {};
		}

		if (cmp) {
			if (!cmp.flatPageStore) {
				cmp = cmp.up('[flatPageStore]');

				if (!cmp) {
					Ext.Error.raise('No context');
				}
			}

			var c = this.flatPageContextMap;

			if (!c.hasOwnProperty(cmp.id)) {
				cmp.on('destroy', function() {
					delete c[cmp.id];
				});
			}

			c[cmp.id] = c[cmp.id] || {flatPageStore: cmp.flatPageStore};

			return c[cmp.id];
		}

		return this.currentContext;
	},


	//<editor-fold desc="Store Iteration">
	//Calls the provided fn on all the stores.  Optionally takes a predicate
	//which skips stores that do not match the predicate
	applyToStores: function(fn, predicate) {
		Ext.Object.each(this.flatPageContextMap, function(k, o) {
			Ext.Object.each(o.currentPageStores, function(k) {
				if (k === 'root') {
					return;
				}

				if (!Ext.isFunction(predicate) || predicate.apply(null, arguments)) {
					Ext.callback(fn, null, arguments);
				}
			});
		});
	},


	applyToStoresThatWantItem: function(fn, item) {
		function predicate(id, store) {
			return store && store.wantsItem(item);
		}

		this.applyToStores(fn, predicate);
	}
});
