Ext.define('NextThought.app.notifications.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: ['NextThought.store.BatchInterface'],

	PAGE_SIZE: 50,

	buildStore: function(url, lastViewed) {
		this.NOTABLE_STORE = NextThought.store.BatchInterface.create({
			url: url,
			params: {
				batchSize: this.PAGE_SIZE
			}
		});

		this.lastViewed = lastViewed;

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
