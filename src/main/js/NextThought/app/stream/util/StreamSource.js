export default Ext.define('NextThought.app.stream.util.StreamSource', {

	requires: ['NextThought.util.Store'],

	DONE: 'done',

	constructor: function(config) {
		this.callParent(arguments);

		if (!config.url) {
			throw 'No URL given for stream source';
		}

		this.url = config.url;
		this.batchParam = config.batchParam || 'batchStart';
		this.sizeParam = config.sizeParam || 'batchSize';
		this.filterParam = config.filterParam || 'filter';
		this.pageSize = config.pageSize || 50;
		this.filters = [];
		this.searchTerm = '';
		this.nextPage = 1;
	},


	__loadPage: function(page) {
		var me = this,
			params = {};

		params[me.batchParam] = (page - 1) * me.pageSize;
		params[me.sizeParam] = me.pageSize;

		if (me.filters.length) {
			params[me.filterParam] = me.filters.join(',');
		}

		return StoreUtils.loadBatch(me.url, params)
			.then(function(batch) {
				me.Links = batch.Links;

				return batch.Items;
			});
	},


	loadNextPage: function() {
		var me = this;

		if (me.isEmpty()) {
			return Promise.reject(this.DONE);
		}

		return me.__loadPage(me.nextPage)
			.then(function(items) {

				if (items.length === 0) {
					return Promise.reject(me.DONE);
				} else if (items.length < me.pageSize) {
					me.__isEmpty = true;
				}

				me.nextPage += 1;

				return items;
			});
	},


	isEmpty: function() {
		return this.__isEmpty;
	},


	/**
	 * Get a link off of the batch, only works if the link is the same for every batch
	 * @param  {String} rel the rel of the link to look for
	 * @return {String}     the link for that rel, or null
	 */
	getLink: function(rel) {},


	/**
	 * Add a filter to the page requests
	 * trigger a reset
	 * @param {String} filters the filter(s) to add
	 */
	addFilter: function(filter) {
		this.addFilters([filter]);
	},


	/**
	 * Add an array of filters
	 * trigger a reset
	 * @param {[String]} filters filters to add
	 */
	addFilters: function(filters) {
		if (!Array.isArray(filters)) {
			filters = [filters];
		}

		this.filters = this.filters.concat(filters);

		this.fireEvent('reset');
	},


	/**
	 * Add a filter if its not currently there, or remove it if it is
	 * trigger a reset
	 * @param  {String} filter
	 * @return {[type]}        [description]
	 */
	toggleFilter: function(filter) {
		var index = this.filters.indexOf(filters);

		if (index > -1) {
			this.filters.splice(index, 1);
		} else {
			this.filters.push(filter);
		}

		this.fireEvent('reset');
	},


	/**
	 * Remove a filter from the list
	 * trigger a reset
	 * @param  {String} filter the filter to remove
	 */
	removeFilter: function(filter) {
 		this.removeFilters([filter]);
	},


	/**
	 * Remove a group of filters from the list
	 * triggers a reset
	 * @param  {[String]} filters the filters to remove
	 */
	removeFilters: function(filters) {
		if (!Array.isArray(filters)) {
			filters = [filters];
		}

		var newFilters = [];

		this.filters.forEach(function(filter) {
			if (filters.indexOf(filter) < 0) {
				newFilters.push(filter);
			}
		});

		this.filters = newFilters;

		this.fireEvent('reset');
	},

	/**
	 * Remove all the current filters
	 * triggers a reset
	 */
	removeAllFilters: function() {
		this.filters = [];

		this.fireEvent('reset');
	},


	/**
	 * Add a search term to the page params
	 * triggers a reset
	 * @param  {String} term term to search for
	 */
	search: function(term) {
		console.warn('Search not implemented yet');
	}
});
