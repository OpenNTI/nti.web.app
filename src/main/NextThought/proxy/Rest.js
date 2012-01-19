Ext.define('NextThought.proxy.Rest', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.nti',
	requires: [
		'NextThought.proxy.writer.Json'
	],

	reader: {
		type: 'nti',
		root: 'Items'
	},
	writer: {
		type: 'nti'
	},


	constructor: function(config) {
		this.callParent(arguments);
		this.on('exception', this._exception, this);
	},

	doRequest: function(){
		this.callParent(arguments);
		if(this.headers){
			delete this.headers;
		}
		//fire an event to Viewport in case anyone cares
		VIEWPORT.fireEvent('object-changed');
	},

	buildUrl: function(request) {
		var host = _AppConfig.server.host,
			action = request.operation.action,
			record = request.records[0],
			mimeType = record.mimeType || record.get('MimeType'),
			href,
			collection;

		this.headers = { 'Content-Type': mimeType+'+json' };

		if (action==='update' || action==='destroy'){
			href = record.getLink('edit');
		}
		else if(action === 'create'){
			collection = _AppConfig.service.getCollectionFor(mimeType,null) || {};
			if (!collection.href) {
				Ext.Error.raise('No HREF found for mimetype ' + mimeType);
			}
			href = host + collection.href;
		}
		else if(action === 'read') {
			href = record.get('href');
		}
		else {
			Ext.Error.raise({
				msg: 'Unexpected action, no defined path for: "'+action+'"',
				request: request,
				action: action
			});
		}


		if(!href) {
			Ext.Error.raise({
				msg:'The URL is undefined!',
				action: action,
				record: record,
				mimeType: mimeType
			});
		}

		return href;
	},

	_exception: function(proxy, response, operation, eOpts) {
		try{
			Ext.callback(operation.failed, operation.scope, [operation.records, operation]);
		}
		catch(e){
			console.error(e.message, e);
		}
		if(response.status !== 404) {
			console.error('Error getting data:', arguments);
		}
	}
});
