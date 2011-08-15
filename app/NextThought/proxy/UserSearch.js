Ext.define('NextThought.proxy.UserSearch', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.usersearch',
    requires: ['NextThought.reader.Json'],
	
	url: '',
    appendId: false, //default
    reader: {type: 'nti'},
    constructor: function(config) {
    	Ext.copyTo(this.reader, config, 'model');
    	this.callParent(arguments);
    },

    buildUrl: function(request){
 	    var me		= this,
	        qs		= request.params.query.split(','),
	        q		= Ext.String.trim(qs[qs.length-1]),
	        url		= _AppConfig.server.host + _AppConfig.server.data + 'UserSearch/' + q;
	        

        request.url = url;
    	request.params = undefined;
    	me.reader.hasContainerId = true;
    	return this.callParent(arguments);
    }
	
});
