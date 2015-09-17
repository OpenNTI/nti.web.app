Ext.define('NextThought.store.BatchInterface', {

	requires: ['NextThought.util.Store'],

	constructor: function(config) {
		this.callParent(arguments);

		this.url = config.url;
		this.batchSize = config.batchSize;
		this.params = config.params;

		this.__nextLink = config.nextLink;
		this.__previousLink = config.previousLink;

		if (config.getNextConfig) {
			this.getNextConfig = config.getNextConfig.bind(this);
		}

		if (config.getPreviousConfig) {
			this.getPreviousConfig = config.getPreviousConfig.bind(this);
		}
	},


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


	getBatch: function() {
		var me = this,
			url = me.getUrl(),
			params = me.getParams();

		me.__load = me.__load || this.__loadBatch(url, params);

		return me.__load;
	},


	getItems: function() {
		var me = this;

		return me.getBatch()
			.then(function(batch) {
				return batch.Items;
			});
	},


	getParams: function() {
		var params = this.params;

		params = params || {};

		if (this.batchSize) {
			params.batchSize = this.batchSize;
		}

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
