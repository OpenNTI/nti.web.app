Ext.define('NextThought.proxy.Search', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.search',
	requires: [
		'NextThought.proxy.reader.Json',
		'NextThought.proxy.reader.JsonCollection',
		'NextThought.proxy.reader.PageItem',
		'NextThought.proxy.writer.Json'
	],

	appendId: false, //default
    reader: {type: 'nti'},
    constructor: function(config) {
		Ext.copyTo(this.reader, config, 'model');
		this.callParent(arguments);
		this.on('exception', this._exception, this);
	},

	buildUrl: function(request){
		var f = Ext.JSON.decode(request.params.filter) || [{}];

		request.url = this.url+(f[0].value || '*');
		request.params = undefined;
		return this.callParent(arguments);
	},

	_exception: function(proxy, resp, operation) {
		try{
			Ext.callback(operation.failed, operation.scope, [operation.records, operation]);
		}
		catch(e){
			console.error(e.message, e);
		}
		console.error('Error searching, try again later', arguments);
    }
	
});
