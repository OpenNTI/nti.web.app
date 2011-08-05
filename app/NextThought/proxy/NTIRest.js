Ext.define('NextThought.proxy.NTIRest', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.nti',
    requires: ['NextThought.reader.NTIJson'],
	
	url: '',
    appendId: true, //default
    reader: {type: 'nti'},

    buildUrl: function(request){
 	    var me 		  = this,
	        operation = request.operation,
	        records   = operation.records || [],
	        record    = records[0],
	        format    = me.format,
	        url       = _AppConfig.server.host + _AppConfig.server.data + 'users/' + _AppConfig.server.username +'/' + me.collectionName,
	        ntiid	  = record ? record.get('ntiid') : me.ntiid ? me.ntiid : undefined,
	        appendId  = me.appendId,
	        id        = record ? record.get('id') : operation.id;

		if (!me.collectionName) {
			throw 'No collectionName given';
		}

 		if (ntiid) {
            if (!url.match(/\/$/)) {
                url += '/';
            }
      
            url += ntiid;
        }
        if (me.appendId && operation.action!='create' && id!==undefined) {
            if (!url.match(/\/$/)) {
                url += '/';
            }
      
            url += id;
        }
        
        request.url = url;
    	
    	me.appendId = false;
    	var result = this.callParent(arguments);
    	me.appendId = appendId;
    	
    	//set up some directions about how to read the data in the reader:
    	this.reader.hasNtiid = !!ntiid;
    	this.reader.hasId = me.appendId && id!==undefined;
    	
    	console.log(
    		'appendId:', me.appendId, 
    		'id:',id,
    		'hasId:',this.reader.hasId, 
    		'record:',record, 
    		'url:',result
    		);
    	
    	return 	result;
    }
	
});
