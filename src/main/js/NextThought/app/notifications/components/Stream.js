Ext.define('NextThought.app.notifications.components.Stream', {
	extend: 'NextThought.app.notifications.components.List',
	alias: 'widget.notifications-stream-list',

	onActivate: function() {
		debugger;
	},


	onDeactivate: function() {
		debugger;
	},


	setUpListeners: function(store) {
		var me = this;

		me.mon(store.backingStore, {
			add: function(s, recs) {
				debugger;
				if (recs) {
					store.add(recs);
					store.sort();
				}
			},
			load: function(s, recs) {
				debugger;
				if (recs) {
					store.loadRecords(recs, {addRecords: true});
					store.sort();
				}

				me.maybeLoadMoreIfNothingNew();
			}
		});

		me.mon(store, {
			add: 'recordsAdded',
			refresh: 'storeLoaded'
		});

		store.loadRecords(store.backingStore.getRange(), {addRecords: true});
	},


	maybeShowMoreItems: function() {
		//if we can't scroll
		var body = document.body,
			height = document.documentElement.clientHeight;

		if (this.el && this.el.isVisible() && height >= body.scrollHeight) {
			this.prefetchNext();
		}
	},


	maybeLoadMoreIfNothingNew: function() {
		if (this.currentCount !== undefined && this.store.getCount() <= this.currentCount) {
			console.log('Need to fetch again. Didn\'t return any new data');
			delete this.currentCount;
			this.prefetchNext();
		} else {
			this.removeMask();
		}
	},

	prefetchNext: Ext.Function.createBuffered(function() {
		var s = this.getStore(), max;

		s = s && s.backingstore;

		if (!s || !s.hasOwnProperty('data')) {
			this.removeMask();
			return;
		}

		this.currentCount = s.getCount();

		if (s.currentPage < max && !s.isLoading()) {
			s.clearOnPageLoad = false;
			s.nextPage();
		} else {
			this.removeMask();
		}
	}, 500, null, null),


	onScroll: function(e, dom) {
		debugger;
	}
});
