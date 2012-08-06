Ext.define('NextThought.overrides.data.Connection',{
	override: 'Ext.data.Connection',

	disableCaching: Ext.isGecko === true,
	withCredentials: true,
	useDefaultXhrHeader: false,

	setOptions: function(options, scope){
		var i, badParams = ['_dc', 'id', 'page', 'start', 'limit', 'group', 'sort'],
			params = options.params || {};
        if(Ext.isGecko){
            badParams.shift();
        }
		if (Ext.isFunction(params)) {
			console.warn('Params were a function!');
			options.params = (params = params.call(scope, options));
		}

		for(i in badParams){
			if(badParams.hasOwnProperty(i)){
				delete params[badParams[i]];
			}
		}

		return this.callParent(arguments);
	}
},function(){
	Ext.Ajax.cors = true;
	Ext.Ajax.withCredentials = true;

	Ext.Ajax.disableCaching = Ext.isGecko === true;
	Ext.Ajax.useDefaultXhrHeader = false;
	Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
	Ext.Ajax.defaultHeaders.Accept= 'application/vnd.nextthought+json';
	Ext.Ajax.on('beforerequest', function(connection,options) {
		if(options&&options.async===false){
			var loc = null;
			try { loc.toString(); }//force an error
			catch (e) {
				loc = e.stack || e.stacktrace;
				loc = loc.toString().split('\n').slice(6).join('\n');

			}
			console.warn( 'Synchronous Call in: \n'+loc, '\nOptions: ', options );
		}
	});
});
