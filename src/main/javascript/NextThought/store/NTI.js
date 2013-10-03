Ext.define('NextThought.store.NTI', {
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.proxy.reader.Json'
	],
	model: 'NextThought.model.Base',
	autoLoad: false,
	defaultPageSize: undefined,
	proxy: {
		type: 'rest',
		noCache: true,
		limitParam: 'batchSize',
		pageParam: undefined,
		startParam: 'batchStart',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'FilteredTotalItemCount'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		}
	},


	constructor: function(config) {
		//Allow partial overriding the proxy.
		if (config && config.proxyOverride) {
			this.proxy = Ext.merge(Ext.clone(this.proxy), this.config.proxyOverride);
			delete config.proxyOverride;
		}


		this.callParent(arguments);

		//Allow shortcutting the url setting.
		if (this.url) {
			this.proxy.url = this.url;
			delete this.url;
		}

		if (!this.pageSize) {
			this.proxy.limitParam = undefined;
			this.proxy.startParam = undefined;
		}
	},


	onProxyLoad: function(operation) {
    var resultSet = operation.getResultSet();
		delete this.batchLinks;
		if (resultSet && resultSet.links) {
			this.batchLinks = resultSet.links;
		}

		return this.callParent(arguments);
	},


	remove: function(records) {
		this.callParent(arguments);

		Ext.each(records, function(record) {
			record.fireEvent('destroy', record);
		});

	}
});
