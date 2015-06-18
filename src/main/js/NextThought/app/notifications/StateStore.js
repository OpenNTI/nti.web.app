Ext.define('NextThought.app.notifications.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: ['NextThought.store.Stream'],

	buildStore: function(url, lastViewed) {
		var store = NextThought.store.Stream.create({
			storeId: 'notifications',
			autoLoad: false,
			pageSize: 50,
			proxy: {
				type: 'rest',
				pageParam: undefined,
				limitParam: 'batchSize',
				startParam: 'batchBefore',
				reader: {
					type: 'nti',
					root: 'Items',
					totalProperty: 'TotalItemCount'
				},
				headers: {
					'Accept': 'application/vnd.nextthought.collection+json'
				},
				model: 'NextThought.model.Change'
			}
		});

		store.lastViewed = lastViewed;
		store.proxy.proxyConfig.url = url;
		store.url = store.proxy.url = url;

		console.debug('Loading notifications:', url);
		store.load();
		this.STREAM_STORE = store;
		this.setLoaded();
	},


	getStore: function() {
		var me = this;

		return me.onceLoaded()
			.then(function() {
				return me.STREAM_STORE;
			});
	}
});
