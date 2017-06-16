const Ext = require('extjs');

const StoreUtils = require('./Store');


module.exports = exports = Ext.define('NextThought.util.PagedPageSource', {

	mixins: {
		observable: 'Ext.util.Observable'
	},


	constructor: function (config) {
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

		if (config.getPrecache) {
			this.getPrecache = config.getPrecache.bind(this);
		}
	},

	//Relative to the total
	getPageNumber: function () {
		return this.getAbsoluteIndex() + 1;//account for zero indexing
	},


	getAbsoluteIndex: function () {
		var currentPage = this.store.getCurrentPage(),
			pageSize = this.store.pageSize;

		//(currentPage - 1) * pageSize = number of records in the pages before this one
		//this.currentindex = the number of records in this page before the current
		return ((currentPage - 1) * pageSize) + this.currentIndex;
	},


	getTotal: function () {
		return this.store.getTotalCount();
	},


	fillInRecord: function (items) {
		return items;
	},

	/**
	 * Check if the index is in the store's current page
	 *
	 * @param  {Integer} absoluteIndex index to look up
	 * @return {Record}				  the record from the store if its there
	 */
	__maybeGetFromStore: function (absoluteIndex) {
		var pageSize = this.store.pageSize,
			currentPage = this.store.getCurrentPage(),
			pageStart = (currentPage - 1) * pageSize,
			pageEnd = (currentPage * pageSize) - 1,
			relativeIndex;

		if (absoluteIndex >= pageStart && absoluteIndex <= pageEnd) {
			relativeIndex = absoluteIndex % pageSize;

			return this.store.getAt(relativeIndex);
		}

		return null;
	},


	__loadRecord: function (index) {
		var store = this.store,
			url = store.proxy.url,
			storeRecord = this.__maybeGetFromStore(index),
			params = Ext.clone(store.proxy.extraParams);

		//if the index is already in the store no need to make a requests
		if (storeRecord) {
			return storeRecord;
		}

		params.batchStart = index;
		params.batchSize = 1;

		return StoreUtils.loadItems(url, params, null, store.model)
			.then(function (items) {
				return items[0];
			})
			.then(this.fillInRecord.bind(this))
			.catch(function (reason) {
				console.error('Failed to load record', reason);
				return null;
			});
	},


	__getPrevious: function (relativeIndex, absoluteIndex) {
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


	__getNext: function (relativeIndex, absoluteIndex) {
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


	load: function () {
		var me = this,
			relativeIndex = me.currentIndex,
			//getPageNumber is not zero indexed but the absoluteIndex needs to be
			absoluteIndex = me.getPageNumber() - 1;

		return Promise.all([
			me.__getPrevious(relativeIndex, absoluteIndex),
			me.__getNext(relativeIndex, absoluteIndex)
		]).then(function (result) {
			me.previous = result[0];
			me.next = result[1];

			return me;
		});
	},


	getTitle: function () {
		return '';
	},


	hasPrevious: function () {
		return !!this.previous;
	},


	hasNext: function () {
		return !!this.next;
	},


	getPrevious: function () {
		return this.getRoute ? this.getRoute(this.previous) : this.previous;
	},


	getNext: function () {
		return this.getRoute ? this.getRoute(this.next) : this.next;
	},


	getPreviousTitle: function () {
		return this.getTitle(this.previous);
	},


	getNextTitle: function () {
		return this.getTitle(this.next);
	},


	getNextPrecache: function () {
		var index = this.currentIndex + 1;

		return this.getPrecache ? this.getPrecache(this.next, index) : null;
	},


	getPreviousPrecache: function () {
		var index = this.currentIndex - 1;

		return this.getPrecache ? this.getPrecache(this.previous, index) : null;
	}
});
