// Ext.define('NextThought.app.notifications.components.Stream', {
// 	extend: 'NextThought.app.notifications.components.List',
// 	alias: 'widget.notifications-stream-list',

// 	mixins: {
// 		Router: 'NextThought.mixins.Router'
// 	},

// 	cls: 'notification-list'
// });

Ext.define('NextThought.app.notifications.components.Stream', {
	extend: 'NextThought.app.notifications.components.List',
	alias: 'widget.notifications-stream-list',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'notification-stream',

	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.onScroll = this.onScroll.bind(this);
	},


	onActivate: function() {
		window.addEventListener('scroll', this.onScroll);
	},


	onDeactivate: function() {
		window.removeEventListener('scroll', this.onScroll);
	},


	getScrollEl: function() {
		//TODO: figure out how to not have to do a user agent check for this
		return Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
	},


	setUpListeners: function(store) {
		var me = this;

		me.mon(store.backingStore, {
			add: function(s, recs) {
				if (recs) {
					store.add(recs);
					store.sort();
				}

				me.removeMask();
			},
			load: function(s, recs) {
				if (recs) {
					store.loadRecords(recs, {addRecords: true});
					store.sort();
				}

				if (!recs || recs.length < store.backingStore.pageSize) {
					me.onLastBatch = true;
				} else {
					me.maybeLoadMoreIfNothingNew();
				}
			}
		});

		me.mon(store, {
			add: 'recordsAdded',
			refresh: 'storeLoaded'
		});

		if (!store.backingStore.getCount() && store.backingStore.loading) {
			me.addMask();
		}

		store.loadRecords(store.backingStore.getRange(), {addRecords: true});
	},


	isOnLastBatch: function() {
		var store = this.getStore();

		return this.onLastBatch || (store.backingStore && store.backingStore.isOnLastBatch());
	},


	maybeShowMoreItems: function() {
		//if we can't scroll
		var body = document.body,
			height = document.documentElement.clientHeight,
			store = this.getStore();

		if (this.isOnLastBatch()) {
			return;
		}

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

		s = s && s.backingStore;


		if (!s || !s.hasOwnProperty('data')) {
			this.removeMask();
			return;
		}

		this.currentCount = s.getCount();

		if (!this.onLastBatch && !s.isLoading()) {
			s.clearOnPageLoad = false;
			this.addMask();
			s.nextPage();
		} else {
			this.removeMask();
		}
	}, 500, null, null),


	onScroll: function() {
		var body = this.getScrollEl(),
			height = document.documentElement.clientHeight,
			top = body.scrollTop,
			scrollTopMax = body.scrollHeight - height,
			//trigger when the top goes over a limit value.
			//That limit value is defined by the max scrollTop can be, minus a buffer zone. (defined here as 10% of the viewable area)
			triggerZone = scrollTopMax - Math.floor(height * 0.1),
			wantedDirection = (this.lastScroll || 0) < top;

		this.lastScroll = top;

		if (wantedDirection && top > triggerZone) {
			this.prefetchNext();
		}
	},


	rowClicked: function(view, rec, item) {
		rec = this.unwrap(rec);

		this.Router.root.attemptToNavigateToObject(rec);
	}
});
