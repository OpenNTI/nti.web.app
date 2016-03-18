var Ext = require('extjs');
var StoreUtils = require('../util/Store');
var UtilStore = require('../util/Store');


/**
 * An interface to interact with batches that come back from the server,
 * specifically around paging using the links provided.
 *
 * @class NextThought.store.BatchInterface
 * @author andrew.ligon@nextthought.com (Andrew Ligon)
 */
module.exports = exports = Ext.define('NextThought.store.BatchInterface', {
    /**
	 * @memberOf NextThought.store.BatchInterface#
	 *
	 * @param {Object} config - values to set up the batch interface with
	 * @param {String} config.url - the url of the batch
	 * @param {Object} config.params - the params to send
	 */
	constructor: function(config) {
		this.callParent(arguments);

		if (!config.url) {
			throw 'No url given to batch interface';
		}

		this.url = config.url;
		this.params = config.params || {};

		this.batchSize = this.params.batchSize;

		this.__nextLink = config.nextLink;
		this.__previousLink = config.previousLink;

		if (config.getNextConfig) {
			this.getNextConfig = config.getNextConfig.bind(this);
		}

		if (config.getPreviousConfig) {
			this.getPreviousConfig = config.getPreviousConfig.bind(this);
		}
	},

    /**
	 * Given a url and params, get a batch from the server
	 *
	 * @memberOf NextThought.store.BatchInterface#
	 *
	 * @param  {String} url - url of the batch
	 * @param  {String} params - params to send back
	 * @return {Promise} - fulfills with the response from the server
	 */
	__loadBatch: function(url, params) {
		if (!url) {
			return Promise.resolve({
				href: 'Bad Batch',
				isBad: true,
				Items: []
			});
		}

		return StoreUtils.loadBatch(url, params);
	},

    getBatch: function(force) {
		var me = this,
			url = me.getUrl(),
			params = me.getParams();

		if (!me.__load || force) {
			me.__load = this.__loadBatch(url, params);
		}

		return me.__load
			.then(function(batch) {
				var next = Service.getLinkFrom(batch.Links || [], 'batch-next'),
					prev = Service.getLinkFrom(batch.Links || [], 'batch-prev');

				if (!prev) {
					batch.isFirst = true;
				}

				if (!next) {
					batch.isLast = true;
				}

				return batch;
			});
	},

    getItems: function(force) {
		var me = this;

		return me.getBatch(force)
			.then(function(batch) {
				return batch.Items;
			});
	},

    getParams: function() {
		var params = this.params;

		params = params || {};

		return params;
	},

    getUrl: function() {
		return this.url;
	},

    getNextConfig: function(current) {
		var link = Service.getLinkFrom(current.Links || [], 'batch-next');

		return link && {url: link};
	},

    getPreviousConfig: function(current) {
		var link = Service.getLinkFrom(current.Links || [], 'batch-previous');

		return link && {url: link};
	},

    __buildBatch: function(config) {
		config.getNextConfig = this.getNextConfig;
		config.getPreviousConfig = this.getPreviousConfig;

		return NextThought.store.BatchInterface.create(config);
	},

    getNextBatch: function() {
		var me = this;

		return me.getBatch()
			.then(function(batch) {
				var config = me.getNextConfig(batch);

				if (!config) {
					return Promise.reject();
				}

				config.previousLink = batch.href;

				return me.__buildBatch(config);
			});
	},

    getPreviousBatch: function() {
		var me = this;

		return me.getBatch()
			.then(function(batch) {
				var config = me.getPreviousConfig(batch);

				if (!config) {
					return Promise.reject();
				}

				config.nextLink = batch.href;

				return me.__buildBatch(config);
			});
	}
});
