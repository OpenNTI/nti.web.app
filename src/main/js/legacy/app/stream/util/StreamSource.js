const Ext = require('extjs');

const BatchInterface = require('legacy/store/BatchInterface');


/**
 * An interface for the BatchInterface to handle paging through a stream of activity.
 * Keeps track of the batch you are on, so you only have to call getNextBatch repeatedly.
 *
 * @class NextThought.app.stream.util.StreamSource
 * @author andrew.ligon@nexthought.com (Andrew Ligon)
 */

module.exports = exports = Ext.define('NextThought.app.stream.util.StreamSource', {
	/**
	 * Construct an instance of a StreamSource
	 *
	 * @memberOf NextThought.app.stream.util.StreamSource#
	 *
	 * @param {Object} config values to set up the stream source with
	 * @param {String} config.batch which batch to start on
	 * @param {String} config.batchParam the value to key the batch on
	 * @param {String} config.batchAfter which batch to start on after a value
	 * @param {String} config.batchAfterParam the value to key the batchAfter on
	 * @param {Array} config.filters filters to apply to the batch
	 * @param {String} config.filterParam the value to key the filters on
	 * @param {Number} config.pageSize the size of the batch
	 * @param {String} config.sizeParam the value to key the size on
	 * @param {String|Object} config.sort the field to sort the items on, or an object
	 * @param {String} config.sort.on the field to sort the items on
	 * @param {String} config.sort.order the order to sort on
	 * @param {String} config.sortParam the value to key the sort on
	 * @param {String} config.sortOrder the order to sort on
	 * @param {Strin} config.sortOrderParam the value to key the sort order on
	 * @param {String} config.context an ntiid to filter to items contained in it
	 * @param {String} config.contextParam the value to key the context on
	 * @return {void}
	 */
	constructor: function (config) {
		this.callParent(arguments);

		if (!config.url) {
			throw new Error('No URL given for stream source');
		}

		this.url = config.url;
		this.extraParams = config.extraParams || {};

		if (config.modifier) {
			this.extraParams = Ext.apply(this.extraParams, config.modifier);
		}

		this.batch = {
			param: config.batchParam || 'batchStart',
			value: config.batch
		};

		this.batchAfter = {
			param: config.batchAfterParam || 'batchAfter',
			value: config.batchAfter
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
			value: config.sortOn || (config.sort && config.sort.on) || 'CreatedTime'
		};

		this.sortOrder = {
			param: config.sortOrderParam || 'sortOrder',
			value: config.sortOrder || (config.sort && config.sort.order) || 'descending'
		};

		this.context = {
			param: config.contextParam || 'topLevelContextFilter',
			value: config.context
		};

		let accepts = config.accepts;

		if (accepts && accepts.join) {
			accepts = accepts.join(',');
		} else if (accepts === '*/*') {
			accepts = null;
		}

		this.accepts = {
			param: config.acceptsParam || 'accept',
			value: accepts
		};
	},

	getURL: function () {
		return this.url;
	},

	/**
	 * Build the params to send back with the request
	 *
	 * @memberOf  NextThought.app.stream.util.StreamSource#
	 * @return {Object} params
	 */
	getParams: function () {
		var params,
			knownParams = [
				this.batch,
				this.batchAfter,
				this.filters,
				this.size,
				this.sort,
				this.sortOrder,
				this.context,
				this.accepts
			];

		params = knownParams.reduce(function (acc, param) {
			if (param.value) {
				acc[param.param] = param.value;
			}

			return acc;
		}, this.extraParams || {});

		return params;
	},

	__getBatch: function () {
		return this.currentBatch;
	},

	getCurrentBatch: function () {
		if (!this.currentBatch) {
			this.currentBatch = new BatchInterface({
				url: this.getURL(),
				params: this.getParams()
			});
		}

		return this.currentBatch.getBatch();
	},

	getNextBatch: function () {
		var me = this,
			batch = me.__getBatch();

		return batch.getNextBatch()
			.then(function (b) {
				me.currentBatch = b;

				return b.getBatch();
			});
	},

	getPreviousBatch: function () {
		var me = this,
			batch = me.__getBatch();

		return batch.getPreviousBatch()
			.then(function (b) {
				me.currentBatch = b;

				return b.getBatch();
			});
	},

	reset: function () {
		delete this.currentBatch;
	},


	fetchNewItems: function () {
		var batch = this.__getBatch();

		if (!batch) {
			return Promise.resolve([]);
		}

		return batch.fetchNewItems();
	}
});
