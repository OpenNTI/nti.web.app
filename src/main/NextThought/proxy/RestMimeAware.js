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
			href = record.get('href'),
			mimeType = record.mimeType || record.get('MimeType'),
			collection;

		this.headers = { 'Content-Type': mimeType+'+json' };

        if (action!='update' && action!='destroy'){
			collection = _AppConfig.service.getCollectionFor(mimeType,null) || {};
			href = host + collection.href;
		}
		else if(!href){
			href = record.getLink('edit');
		}

		if(!href) Ext.Error.raise({
			msg:'The URL is undefined!',
			action: action,
			record: record,
			mimeType: mimeType
		});

        return href;
    },

    _exception: function(proxy, response, operation, eOpts) {
        console.error('Error getting data:', arguments, '\n', printStackTrace().join('\n'));
    }
});
