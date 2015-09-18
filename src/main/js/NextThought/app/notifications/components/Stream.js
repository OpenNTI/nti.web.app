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
		this.callParent(arguments);

		window.addEventListener('scroll', this.onScroll);
	},


	onDeactivate: function() {
		this.callParent(arguments);

		window.addEventListener('scroll', this.onScroll);
	},


	getScrollEl: function() {
		//TODO: figure out how to not have to do a user agent check for this
		return Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
	},


	isOnLastBatch: function() {
		return this.isLastBatch;
	},


	maybeShowMoreItems: function() {
		//if we can't scroll
		var body = document.body,
			height = document.documentElement.clientHeight;

		if (this.isOnLastBatch()) {
			return;
		}

		if (this.el && this.el.isVisible() && height >= body.scrollHeight) {
			this.prefetchNext();
		}
	},


	prefetchNext: Ext.Function.createBuffered(function() {
		if (!this.isOnLastBatch()) {
			this.currentBatch.getNextBatch()
				.then(this.loadBatch.bind(this));
		}
	}, 500, null, null),


	onScroll: function() {
		var body = this.getScrollEl(),
			height = document.documentElement.clientHeight,
			top = body.scrollTop,
			scrollTopMax = body.scrollHeight - height,
			//trigger when the top goes over a limit value
			//That limit value is defined by the max scrollTop can be, minus a buffer zone. (defined here as 10% of the viewable area)
			triggerZone = scrollTopMax - Math.floor(height * 0.1),
			wantedDirection = (this.lastScroll || 0) < top;

		this.lastScroll = top;

		if (wantedDirection && top > triggerZone) {
			this.prefetchNext();
		}
	}

});

// Ext.define('NextThought.app.notifications.components.Stream', {
// 	extend: 'NextThought.app.notifications.components.List',
// 	alias: 'widget.notifications-stream-list',

// 	mixins: {
// 		Router: 'NextThought.mixins.Router'
// 	},

// 	cls: 'notification-stream',

// 	initComponent: function() {
// 		this.callParent(arguments);

// 		this.initRouter();

// 		this.onScroll = this.onScroll.bind(this);
// 	},


// 	onActivate: function() {
// 		window.addEventListener('scroll', this.onScroll);
// 	},


// 	onDeactivate: function() {
// 		window.removeEventListener('scroll', this.onScroll);
// 	},


// 	getScrollEl: function() {
// 		//TODO: figure out how to not have to do a user agent check for this
// 		return Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
// 	},


// 	isOnLastBatch: function() {
// 		return false;
// 	},


// 	maybeShowMoreItems: function() {
// 		//if we can't scroll
// 		var body = document.body,
// 			height = document.documentElement.clientHeight;

// 		if (this.isOnLastBatch()) {
// 			return;
// 		}

// 		if (this.el && this.el.isVisible() && height >= body.scrollHeight) {
// 			this.prefetchNext();
// 		}
// 	},


// 	maybeLoadMoreIfNothingNew: function() {
// 		if (this.currentCount !== undefined && this.store.getCount() <= this.currentCount) {
// 			console.log('Need to fetch again. Didn\'t return any new data');
// 			delete this.currentCount;
// 			this.prefetchNext();
// 		} else {
// 			this.removeMask();
// 		}
// 	},

// 	prefetchNext: Ext.Function.createBuffered(function() {

// 	}, 500, null, null),


// 	onScroll: function() {
// 		var body = this.getScrollEl(),
// 			height = document.documentElement.clientHeight,
// 			top = body.scrollTop,
// 			scrollTopMax = body.scrollHeight - height,
// 			//trigger when the top goes over a limit value.
// 			//That limit value is defined by the max scrollTop can be, minus a buffer zone. (defined here as 10% of the viewable area)
// 			triggerZone = scrollTopMax - Math.floor(height * 0.1),
// 			wantedDirection = (this.lastScroll || 0) < top;

// 		this.lastScroll = top;

// 		if (wantedDirection && top > triggerZone) {
// 			this.prefetchNext();
// 		}
// 	},


// 	rowClicked: function(view, rec, item) {
// 		rec = this.unwrap(rec);

// 		this.Router.root.attemptToNavigateToObject(rec);
// 	}
// });
