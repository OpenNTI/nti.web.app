Ext.define('NextThought.app.notifications.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: ['NextThought.store.Stream'],

	PAGE_SIZE: 50,

	buildStore: function(url, lastViewed) {
		var store;

		store = NextThought.store.Stream.create({
			storeId: 'notification',
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

		this.NOTABLE_STORE = store;

		store.load();
		this.setLoaded();
	},


	getStore: function() {
		var me = this;

		return this.onceLoaded()
			.then(function() {
				return me.NOTABLE_STORE;
			});
	}
});
