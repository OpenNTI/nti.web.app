Ext.define('NextThought.proxy.Preference', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.preference',
	requires: ['NextThought.proxy.reader.Json'],
	
	url: '',
	appendId: false, //default
	reader: {
        type: 'nti',
        root: 'Items'
    },
	constructor: function(config) {
		Ext.copyTo(this.reader, config, 'model');
		this.callParent(arguments);
		this.on('exception', this.exception, this);
	},

	buildUrl: function(request){
		var me = this,
			id = request.params.id;

		request.url = id;
		return this.callParent(arguments);
	},

	exception: function(proxy, resp, operation) {
		try{
			Ext.callback(operation.failed, operation.scope, [operation.records, operation]);
		}
		catch(e){
			console.error(e.message, e);
		}
		if(resp.status !== 404) {
			console.error('Error searching for users, try again later', arguments);
		}
	}
	
});