Ext.define('NextThought.app.notifications.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: ['NextThought.store.BatchInterface'],

	PAGE_SIZE: 50,

	buildStore: function(url, lastViewed) {
		var me = this;

		me.NOTABLE_STORE = NextThought.store.BatchInterface.create({
			url: url,
			batchSize: me.PAGE_SIZE,
			params: {
				batchBefore: new Date() / 1000
			},
			getNextConfig: function(batch) {
				var item = batch.Items.last(),
					lastModified = item && item.raw['Last Modified'];

				lastModified = lastModified || (new Date(0) / 1000);

				return {
					url: url,
					batchSize: me.PAGE_SIZE,
					params: {
						batchBefore: lastModified
					}
				};
			}
		});

		me.lastViewed = lastViewed;

		me.setLoaded();
	},


	getStore: function() {
		var me = this;

		return this.onceLoaded()
			.then(function() {
				return me.NOTABLE_STORE;
			});
	}
});
