

Ext.define('NextThought.Library', {
	extend: 'Ext.util.Observable',
	_tocs: [],
	
    constructor: function(config) {
        this.addEvents({
            loaded : true
        });

        this.callParent(arguments);
        return this;
    },
    
    getTitles: function(){
    	return this._library.titles;
    },
    
    getToc: function(index){
    	if(index && !this._tocs[index]){
    		this._loadToc(index);
    	}
    	
    	return this._tocs[index];
    },
    
    
	load: function(){
		if(this._library || this._req){
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
				if(NextThought.isDebug) 
					console.log('failed to load library');
					 
				//alert("Failed to load library");
                window.location.reload();
				this._req = null;
			},
			success: function(r,o) {
				this._library = Ext.decode(r.responseText);
				this._libraryLoaded(Ext.bind(go,this));
			}
		});
		
		
		function go(){
			this.fireEvent('loaded',this._library);
			this._req = null;
		}
	},
	
	
	
    _libraryLoaded: function(callback){
		var me = this, stack = [];
	    //The reason for iteration 1 is to load the stack with the number of TOCs I'm going to load
		Ext.each(this._library.titles, function(o){
			if(!o.index){ return; }
			stack.push(o.index);
		});

        //Iteration 2 loads TOC async, so once the last one loads, callback if available
		Ext.each(this._library.titles, function(o){
			if(!o.index){return;}
			me._loadToc(o.index, function(){
				stack.pop();
				if(stack.length==0 && callback){
					callback.call(this);
				}
			});
		});
	},
	
	
	_loadToc: function(index, callback){
		var url = _AppConfig.server.host+index;
		Ext.Ajax.request({
			url: url,
			async: !!callback,
			scope: this,
			failure: function() {
                Logging.logAndAlertError('There was an error loading library', url, arguments);
            },
			success: function(r,o) { 
				this._tocs[index] = r.responseXML? r.responseXML : this._parseXML(r.responseText);
				if(!this._tocs[index]){
					console.log('WARNING: no data for index: '+url);
				} 
				if( callback ){
					callback();
				}
			}
		});
	},
	
	_parseXML: function(txt) {
		if (window.DOMParser) {
			return new DOMParser().parseFromString(txt,"text/xml");
		}
		
		// Internet Explorer
		var x = new ActiveXObject("Microsoft.XMLDOM");
		x.async="false"; 
		x.loadXML(txt);
		return x;
	},

    findLocation: function(containerId) {
        var result = null;

        Ext.each(this._library.titles, function(o){
            result = this._resolveBookLocation(o, containerId);
            if (result) return false;
        }, this);

        return result;
    },

    _resolveBookLocation: function(book, containerId) {
        var xml = this.getToc(book.index),
			l = Ext.DomQuery.selectNode("topic[ntiid="+containerId+"]",xml);

        if (l) return {book:book, location:l};

        //if l wasn't resolved.
        return null;
    }
});