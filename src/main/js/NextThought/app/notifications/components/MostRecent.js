Ext.define('NextThought.app.notifications.components.MostRecent', {
	extend: 'NextThought.app.notifications.components.List',
	alias: 'widget.notifications-most-recent',

	SHOW_COUNT: 20,

	cls: 'recent-notifications',

	onActivate: function() {
		this.store.lastViewed = new Date();
		this.clearBadge();
	},


	maybeNotify: function() {
		var count = 0,
			store = this.store.backingStore,
			cap = store.pageSize - 1,
			lastViewed = store.lastViewed || new Date(0),
			links = store.batchLinks || {};

		this._lastViewedURL = links.lastViewed;

		store.each(function(c) {
			if (c.get('CreatedTime') > lastViewed) {
				count += 1;
			}
		});

		if (count > cap) {
			count = cap + '+';
		}

		this.setBadgeValue(count);
	},


	setBadgeValue: function(count) {
		var v = count || '';

		this.badgeValue = v;

		this.updateBadge(this.badgeValue);
	},


	beginClearBadge: function(delay) {
		this.store.lastViewed = new Date();

		wait(delay || 3000)
			.then(this.clearBadge.bind(this));
	},


	clearBadge: function() {
		if (!this.badgeValue) {
			return;
		}

		this.maybeNotify();

		if (this._lastViewedURL && this.store && this.store.lastViewed) {
			//the server is expecting seconds
			Service.put(this._lastViewedURL, this.store.lastViewed.getTime() / 1000);
		}
	},


	rowClicked: function(view, rec, item) {
		rec = this.unwrap(rec);

		this.navigateToObject(rec);
	},


	//Be sure to not show dividers in the most recent
	insertDividers: function() {},


	setUpListeners: function(store) {
		this.mon(store.backingStore, {
			add: 'updateRecords',
			refresh: 'updateRecords'
		});

		this.updateRecords();
	},


	updateRecords: function() {
		var range = this.store.backingStore.getRange(),
			subRange = range.slice(0, this.SHOW_COUNT);

		this.store.loadRecords(subRange);
		this.storeLoaded(this.store);
		this.maybeNotify();
	}
});
