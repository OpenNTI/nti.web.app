export default Ext.define('NextThought.proxy.courseware.PagedPageSource', {
	extend: 'NextThought.util.PageSourceStore',

	constructor: function(cfg) {
		this.mixins.observable.constructor.call(this);
		this.initConfig(cfg);

		if (cfg.startingRec) {
			this.setCurrent(cfg.startingRec);
		} else {
			this.currentIndex = 0;
		}
	},


	setCurrent: function(record) {
		var currentPage = this.store.getCurrentPage(),
			pageSize = this.store.pageSize,
			currentIndex = this.store.indexOf(record);

		this.currentIndex = ((currentPage - 1) * pageSize) + currentIndex;
	},


	getTotal: function() {
		return this.store.getTotalCount();
	},


	getPageNumber: function() {
		return this.getCurrentPosition() + 1;
	},


	getCurrentPosition: function() {
		return this.currentIndex;
	},


	__loadPage: function(page) {
		var store = this.store,
			current = store.currentPage,
			total = this.getTotal(),
			totalPages = Math.ceil(total / store.pageSize);

		/*
			Don't try to load the page if

			1.) we are already on that page return success
			2.) the page is less then the first page return failure
			3.) the page is greater than the last page return failure
		 */
		if (current === page) {
			return Promise.resolve();
		}

		if (page < 1 || page > totalPages) {
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			store.loadPage(page, {
				callback: function(records, op, success) {
					if (success) {
						wait()
							.then(fulfill.bind(null, records));
					} else {
						reject();
					}
				}
			});
		});
	},


	getCurrent: function() {
		var pageSize = this.store.pageSize;

		return this.store.getAt(this.currentIndex % pageSize);
	},


	/**
	 * Load the next record in the store.
	 *
	 * Look at the index of the current record, if it is:
	 *
	 * 1.) the last record in the store: fulfill with the current
	 * 2.) the last record on a page: load the next page and fulfill with the next record
	 * 3.) in the middle of a page: fulfill with the next record
	 *
	 * @return {Promise} fulfills with the next record
	 */
	getNext: function() {
		var me = this,
			nextPage = me.store.currentPage,
			currentIndex = me.getCurrentPosition(),
			nextIndex = currentIndex,//default to returning the current record
			total = me.getTotal();

		//if we aren't the last record try to get the next one
		if (currentIndex < (total - 1)) {
			nextIndex = currentIndex + 1;
			nextPage = Math.ceil((nextIndex + 1) / me.store.pageSize);
		}

		return me.__loadPage(nextPage)
			.then(function() {
				me.currentIndex = nextIndex;
				return me.getCurrent();
			})
			.fail(function() {
				return me.getCurrent();
			});
	},


	/**
	 * Load the previous record in the store by.
	 *
	 * Look at the index of the current record, if it is:
	 *
	 * 1.) the first record in the store: fulfill with the current
	 * 2.) the first record on a page: load the previous page and fulfill with the previous record
	 * 3.) in the middle of a page: fulfill with the previous record
	 *
	 * @return {Promise} fulfills with the previous record
	 */
	getPrevious: function() {
		var me = this,
			prevPage = me.store.currentPage,
			currentIndex = me.getCurrentPosition(),
			prevIndex = currentIndex,
			total = me.getTotal();

		//if we aren't the first record try to get the previous one
		if (currentIndex > 0) {
			prevIndex = currentIndex - 1;
			prevPage = Math.floor(prevIndex / me.store.pageSize) + 1;
		}

		return me.__loadPage(prevPage)
			.then(function() {
				me.currentIndex = prevIndex;
				return me.getCurrent();
			})
			.fail(function() {
				return me.getCurrent();
			});
	},


	hasNext: function() {
		var currentPosition = this.getCurrentPosition(),
			total = this.getTotal();

		return currentPosition < total - 1;
	},


	hasPrevious: function() {
		var currentPosition = this.getCurrentPosition();

		return currentPosition > 0;
	}
});
