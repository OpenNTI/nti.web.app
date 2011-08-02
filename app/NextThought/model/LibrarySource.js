

Ext.define('NextThought.model.LibrarySource', {
	extend: 'Ext.util.Observable',
	
    constructor: function(config) {
        this.addEvents({
            loaded : true
        });

		Ext.copyTo(this,config,'listeners');
        this.self.superclass.constructor.call(this, config);
        return this;
    },
    
	load: function(){
		if(this._library || this._req){
			//?
			//this.fireEvent('loaded',this._library);
			console.log('already loaded/loading');
			return false;
		}
		
		
		var b = _AppConfig.server.host,
			l = _AppConfig.server.library;
		this._req = Ext.Ajax.request({
			url: b + l,
			scope: this,
			failure: function(r,o) {
				console.log('failed to load library'); 
				this._library = null;
				go.call(this);
			},
			success: function(r,o) {
				this._library = Ext.decode(r.responseText);
				go.call(this);
			}
		});
		
		
		function go(){
			this.fireEvent('loaded',this._library);
			this._req = null;
		}
	},
	
	

});