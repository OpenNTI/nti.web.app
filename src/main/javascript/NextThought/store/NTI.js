Ext.define('NextThought.store.NTI',{
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.proxy.reader.Json'
	],
	model: 'NextThought.model.Base',
	autoLoad: false,
	defaultPageSize: undefined,
	proxy: {
		type: 'rest',
		limitParam: 'batchSize',
		pageParam: undefined,
		startParam: 'batchStart',
		reader: {
			type: 'nti',
			root: 'Items'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		}
	},


	constructor: function(){
		var r = this.callParent(arguments);
		//Allow shortcutting the url setting.
		if(this.url){
			this.proxy.url = this.url;
			delete this.url;
		}

		if(!this.pageSize){
			this.proxy.limitParam = undefined;
			this.proxy.startParam = undefined;
		}
		return r;
	},


	onProxyLoad: function(operation) {
        var resultSet = operation.getResultSet();
		delete this.batchLinks;
		if( resultSet && resultSet.links){
			this.batchLinks = resultSet.links;
			console.log(this.batchLinks);
		}

		return this.callParent(arguments);
	},


	remove: function(records){
		this.callParent(arguments);

		Ext.each(records, function(record){
			record.fireEvent('destroy',record);
		});

	}
});
