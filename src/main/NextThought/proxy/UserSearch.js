Ext.define('NextThought.proxy.UserSearch', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.usersearch',
	requires: ['NextThought.proxy.reader.Json'],
	
	url: '',
	appendId: false, //default
	reader: {type: 'nti'},
	constructor: function(config) {
		Ext.copyTo(this.reader, config, 'model');
		this.callParent(arguments);
		this.on('exception', this._exception, this);
	},

	buildUrl: function(request){
		var me		= this,
			qs		= request.params.query.split(','),
			q		= Ext.String.trim(qs[qs.length-1]);
		request.url = _AppConfig.service.getUserSearchURL(q);
		request.params = undefined;
		me.reader.hasContainerId = true;
		return this.callParent(arguments);
	},

	_exception: function(proxy, resp, operation) {
		try{
			Ext.callback(operation.failed, operation.scope, [operation.records, operation]);
		}
		catch(e){
			console.error(e.message, e);
		}
		if(resp.status != 404)
			console.error('Error searching for users, try again later', arguments);
	}
	
});
