Ext.define('NextThought.proxy.Rest', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.nti',
	requires: [
		'NextThought.proxy.writer.Json',
		'NextThought.proxy.reader.Json'
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

	doRequest: function(operation, callback, scope){
		operation.retryArgs = {callback: callback, scope: scope};

		this.callParent(arguments);
		if(this.headers){
			delete this.headers;
		}
		//fire an event to Viewport in case anyone cares
		if(window.VIEWPORT){
			VIEWPORT.fireEvent('object-changed');
		}
	},

	buildUrl: function(request) {
		var host = _AppConfig.server.host,
			action = request.operation.action,
			records= request.records,
			record = records? records[0] : null,
			mimeType = record? record.mimeType || record.get('MimeType') : 'application/vnd.nextthought',
			href,
			collection;

		this.headers = {};

		//making sure headers propagate
		Ext.apply(this.headers, request.headers || {});
		Ext.apply(this.headers, request.operation.headers || {});
		Ext.apply(this.headers,  { 'Content-Type': mimeType+'+json' });

		if(!record){
			return request.operation.url || request.url || this.url;
		}

		if (request.operation.url || request.url) {
			console.log('returning set url. not generating a new one', 'operation url', this.operation ? this.operation.url: 'NA', 'request url', request.url);
			return request.operation.url || request.url;
		}
		
		if (action==='update' || action==='destroy'){
			href = record.getLink('edit');
		}
		else if(action === 'create'){
			collection = _AppConfig.service.getCollectionFor(mimeType,null) || {};
			if (!collection.href) {
				Ext.Error.raise('No HREF found for mimetype ' + mimeType);
			}
			href = host + Globals.ensureSlash(collection.href, true);
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
		var retryArgs = operation.retryArgs;

		if(response.status === 0) {
			//Um, probably a 302 on CORS
			console.warn('CORS 302? Retrying w/ known redirects.',
					{
						Proxy:proxy,
						Response:response,
						Operation: operation
					});

			if(retryArgs && operation.action === 'read'){
				operation.url += '/Classes';
				this.read(operation, retryArgs.callback,retryArgs.scope);
			}
			return;
		}
		else if(response.status !== 404) {
			console.error('Error getting data:', arguments);
		}

		try{
			Ext.callback(operation.failed, operation.scope, [operation.records, operation]);
		}
		catch(e){
			console.error(e.message, e);
		}
	}
});
