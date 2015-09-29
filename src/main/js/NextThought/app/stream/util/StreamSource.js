/**
 * An interface for the BatchInterface to handle paging through a stream of activity.
 * Keeps track of the batch you are on, so you only have to call getNextBatch repeatedly.
 *
 * @class NextThought.app.stream.util.StreamSource
 * @author andrew.ligon@nexthought.com (Andrew Ligon)
 */
Ext.define('NextThought.app.stream.util.StreamSource', {

	requires: ['NextThought.store.BatchInterface'],

	/**
	 * Construct an instance of a StreamSource
	 *
	 * @memberOf NextThought.app.stream.util.StreamSource#
	 *
	 * @param {Object} config - values to set up the stream source with
	 * @param {String} config.batch - which batch to start on
	 * @param {String} config.batchParam - the value to key the batch on
	 * @param {Array} config.filters - filters to apply to the batch
	 * @param {String} config.filterParam - the value to key the filters on
	 * @param {Number} config.pageSize - the size of the batch
	 * @param {String} config.sizeParam - the value to key the size on
	 * @param {String} config.sort - the field to sort the items on
	 * @param {String} config.sortParam - the value to key the sort on
	 * @param {String} config.context - an ntiid to filter to items contained in it
	 * @param {String} config.contextParam - the value to key the context on
	 */
	constructor: function(config) {
		this.callParent(arguments);

		if (!config.url) {
			throw 'No URL given for stream source';
		}

		this.url = config.url;
		this.extraParams = config.extraParams || {};

		this.batch = {
			param: config.batchParam || 'batchStart',
			value: config.batch
		};

		this.filters = {
			param: config.filterParam || 'filter',
			value: config.filters
		};

		this.size = {
			param: config.sizeParam || 'batchSize',
			value: config.pageSize || 50
		};

		this.sort = {
			param: config.sortParam || 'sortOn',
			value: config.sortOn || 'Created'
		};

		this.context = {
			param: config.contextParam || 'topLevelContextFilter',
			value: config.context
		};
	},


	getURL: function() {
		return this.url;
	},

	/**
	 * Build the params to send back with the request
	 *
	 * @memberOf  NextThought.app.stream.util.StreamSource#
	 * @return {Object} params
	 */
	getParams: function() {
		var params,
			knownParams = [
				this.batch,
				this.filters,
				this.size,
				this.sort,
				this.context
			];

		params = knownParams.reduce(function(acc, param) {
			if (param.value) {
				acc[param.param] = param.value;
			}

			return acc;
		}, this.extraParams || {});

		return params;
	},


	__getBatch: function() {
		return this.currentBatch;
	},


	getCurrentBatch: function() {
		if (!this.currentBatch) {
			this.currentBatch = new NextThought.store.BatchInterface({
				url: this.getURL(),
				params: this.getParams()
			});
		}

		return this.currentBatch.getBatch();
	},


	getNextBatch: function() {
		var me = this;

		return me.__getBatch()
			.then(function(batch) {
				return batch.getNextBatch();
			})
			.then(function(batch) {
				me.currentBatch = batch;

				return batch;
			});
	},


	getPreviousBatch: function() {
		var me = this;

		return me.__getBatch()
			.then(function(batch) {
				return batch.getPreviousBatch();
			})
			.then(function(batch) {
				me.currentBatch = batch;

				return batch;
			});
	},


	reset: function() {
		delete this.currentBatch;
	}
});
