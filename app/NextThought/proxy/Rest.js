Ext.define('NextThought.proxy.Rest', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.nti',
    requires: ['NextThought.reader.Json'],
	
	url: '',
    appendId: true, //default
    reader: {type: 'nti'},
    constructor: function(config) {
    	Ext.copyTo(this.reader, config, 'model');
    	this.callParent(arguments);
    },

    buildUrl: function(request){
 	    var me 		  = this,
	        operation = request.operation,
	        records   = operation.records || [],
	        record    = records[0],
	        format    = me.format,
	        url       = _AppConfig.server.host + _AppConfig.server.data + 'users/' + _AppConfig.server.username +'/' + me.collectionName,
	        containerId	  = record ? record.get('ContainerId') : me.containerId ? me.containerId : undefined,
	        appendId  = me.appendId,
	        id        = record ? record.get('id') : operation.id;
	        
		if (!me.collectionName) {
			throw 'No collectionName given';
		}
		// if (!containerId) {
			// throw 'No containerId given';
		// }
		
 		if (containerId) {
            if (!url.match(/\/$/)) {
                url += '/';
            }
      
            url += containerId;
        }
        if (me.appendId && operation.action!='create' && id!==undefined) {
            if (!url.match(/\/$/)) {
                url += '/';
            }
      
            url += id;
        }
        
        request.url = url;
    	
    	me.appendId = false;
    	var result = me.callParent(arguments);
    	me.appendId = appendId;
    	
    	//set up some directions about how to read the data in the reader:
    	me.reader.hasContainerId = me.reader.hasContainerId || !!containerId;
    	me.reader.hasId = me.appendId && id!==undefined;
    	
    	// if(NextThought.isDebug){
	    	// console.log(
	    		// 'appendId:', me.appendId, 
	    		// 'id:',id,
	    		// 'hasId:',me.reader.hasId, 
	    		// 'record:',record, 
	    		// 'url:',result
	    		// );
    	// }
    	
    	return 	result;
    }
	
});
