Ext.define('NextThought.proxy.UserSearch', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.usersearch',
    requires: ['NextThought.proxy.reader.Json',
               'NextThought.util.Logging'],
	
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
	        q		= Ext.String.trim(qs[qs.length-1]),
	        url		= _AppConfig.server.host + _AppConfig.server.data + 'UserSearch/' + q;
	        

        request.url = url;
    	request.params = undefined;
    	me.reader.hasContainerId = true;
    	return this.callParent(arguments);
    },

    _exception: function() {
        console.log('Error searching for users, try again later', arguments);
    }
	
});
