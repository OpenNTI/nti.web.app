Ext.define('NextThought.util.PagedPageSource', {

	requires: 'NextThought.util.Store',

	mixins: {
		observable: 'Ext.util.Observable'
	},


	constructor: function(config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this);

		//relative to the page
		this.currentIndex = config.currentIndex || 0;
		this.store = config.store;

		if (config.getTitle) {
			this.getTitle = config.getTitle.bind(this);
		}

		if (config.getRoute) {
			this.getRoute = config.getRoute.bind(this);
		}

		if (config.fillInRecord) {
			this.fillInRecord = config.fillInRecord.bind(this);
		}
	},

	//Relative to the total
	getPageNumber: function() {
		var currentPage = this.store.getCurrentPage(),
			pageSize = this.store.pageSize;

		//(currentPage - 1) * pageSize = the number of records in the pages before this one
		//this.currentIndex + 1 = the number records in this page before the current account for 0 indexing
		return ((currentPage - 1) * pageSize) + this.currentIndex + 1;
	},


	getTotal: function() {
		return this.store.getTotalCount();
	},


	fillInRecord: function(items) {
		return items;
	},


	__loadRecord: function(index) {
		var store = this.store,
			url = store.proxy.url,
			params = Ext.clone(store.proxy.extraParams);

		params.batchStart = index;
		params.batchSize = 1;

		return StoreUtils.loadItems(url, params, null, store.model)
			.then(function(items) {
				return items[0];
			})
			.then(this.fillInRecord.bind(this))
			.then(function(item) {
				return item;
			})
			.fail(function(reason) {
				console.error('Failed to load record', reason);
				return null;
			});
	},


	__getPrevious: function(relativeIndex, absoluteIndex) {
		var prev = relativeIndex - 1;

		if (prev >= 0) {
			return Promise.resolve(this.store.getAt(prev));
		}

		prev = absoluteIndex - 1;

		if (prev >= 0) {
			return this.__loadRecord(prev);
		}

		return Promise.resolve(null);
	},


	__getNext: function(relativeIndex, absoluteIndex) {
		var next = relativeIndex + 1,
			pageSize = this.store.pageSize,
			total = this.store.getTotalCount();

		if (next < pageSize) {
			return Promise.resolve(this.store.getAt(next));
		}

		next = absoluteIndex + 1;

		if (next < total) {
			return this.__loadRecord(next);
		}

		return Promise.resolve(null);
	},


	load: function() {
		var me = this,
			relativeIndex = me.currentIndex,
			//getPageNumber is not zero indexed but the absoluteIndex needs to be
			absoluteIndex = me.getPageNumber() - 1;

		return Promise.all([
				me.__getPrevious(relativeIndex, absoluteIndex),
				me.__getNext(relativeIndex, absoluteIndex)
			]).then(function(result) {
				me.previous = result[0];
				me.next = result[1];

				return me;
			});
	},


	getTitle: function() {
		return '';
	},


	hasPrevious: function() {
		return !!this.previous;
	},


	hasNext: function() {
		return !!this.next;
	},


	getPrevious: function() {
		return this.getRoute ? this.getRoute(this.previous) : this.previous;
	},


	getNext: function() {
		return this.getRoute ? this.getRoute(this.next) : this.next;
	},


	getPreviousTitle: function() {
		return this.getTitle(this.previous);
	},


	getNextTitle: function() {
		return this.getTitle(this.next);
	}
});
