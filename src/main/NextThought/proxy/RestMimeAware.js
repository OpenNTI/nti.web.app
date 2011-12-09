Ext.define('NextThought.proxy.RestMimeAware', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.nti-mimetype',
    requires: [
		'NextThought.proxy.reader.JsonCollection',
		'NextThought.proxy.writer.Json'
	],

//	reader: {
//		type: 'nti-collection',
//		root: 'Items'
//	},


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
			collection = _AppConfig.service.getCollectionFor(mimeType,null) || {},
			href = record.get('href');

        if (action!='update' && action!='destroy'){
			this.headers = { 'Content-Type': mimeType+'+json' };
			href = collection.href.split('/');
			href.pop();
			href = href.join('/');
		}

        return host + href;
    },

    _exception: function(proxy, response, operation, eOpts) {
        console.error('Error getting data:', arguments, '\n', printStackTrace().join('\n'));
    }
});
