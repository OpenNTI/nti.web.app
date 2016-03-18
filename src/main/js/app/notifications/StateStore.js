var Ext = require('extjs');
var CommonStateStore = require('../../common/StateStore');
var StoreBatchInterface = require('../../store/BatchInterface');


module.exports = exports = Ext.define('NextThought.app.notifications.StateStore', {
    extend: 'NextThought.common.StateStore',
    PAGE_SIZE: 50,
    ACTIVE_VIEWS: 0,

    buildStore: function(url, lastViewed) {
		var me = this;

		me.NOTABLE_STORE = NextThought.store.BatchInterface.create({
			url: url,
			batchSize: me.PAGE_SIZE,
			params: {
				batchSize: me.PAGE_SIZE
			},
			getNextConfig: function(batch) {
				var item = batch.Items.last(),
					lastModified = item && item.raw['Last Modified'];

				lastModified = lastModified || (new Date(0) / 1000);

				return {
					url: url,
					batchSize: me.PAGE_SIZE,
					params: {
						batchBefore: lastModified,
						batchSize: me.PAGE_SIZE
					}
				};
			}
		});

		me.lastViewed = lastViewed;

		me.setLoaded();

		me.NOTABLE_STORE.getItems()
			.then(me.__getInitialUnseenCount.bind(me))
			.then(me.__updateUnseenCount.bind(me));
	},

    getStore: function() {
		var me = this;

		return this.onceLoaded()
			.then(function() {
				return me.NOTABLE_STORE;
			});
	},

    updateLastViewed: function() {
		this.getStore()
			.then(function(store) {
				return store.getBatch();
			})
			.then(function(batch) {
				var link = Service.getLinkFrom(batch.Links, 'lastViewed'),
					lastViewed = new Date();

				if (link) {
					//the server is expecting seconds
					Service.put(link, lastViewed.getTime() / 1000);
				}
			})
			.then(this.__updateUnseenCount.bind(this, 0, true));
	},

    addRecord: function(change) {
		this.getStore()
			.then(function(store) {
				return store.getBatch();
			})
			.then(function(batch) {
				batch.Items.unshift(change);
			});

		this.fireEvent('record-added', change);

		this.__updateUnseenCount(this.unseen + 1);
	},

    removeRecord: function(change) {
		this.fireEvent('record-deleted', change);
	},

    addActiveView: function() {
		this.ACTIVE_VIEWS += 1;

		this.updateLastViewed();
	},

    removeActiveView: function() {
		this.ACTIVE_VIEWS -= 1;

		this.updateLastViewed();

		if (this.ACTIVE_VIEWS < 0) {
			this.ACTIVE_VIEWS = 0;
		}
	},

    __getInitialUnseenCount: function(items) {
		var lastViewed = this.lastViewed;

		return items.reduce(function(acc, item) {
			if (item.get('Last Modified') > lastViewed) {
				acc += 1;
			}

			return acc;
		}, 0);
	},

    __updateUnseenCount: function(count, force) {
		if (this.ACTIVE_VIEWS === 0 || force) {
			this.unseen = count;
			count = count >= 50 ? count + '+' : count;
			this.fireEvent('update-unseen-count', count);
		}
	}
});
