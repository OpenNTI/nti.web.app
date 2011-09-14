

Ext.define('NextThought.Library', {
	extend: 'Ext.util.Observable',
	requires:[
        'NextThought.model.Title'
    ],
	
    constructor: function(config) {
        this._tocs = [];
        this.store = Ext.create('Ext.data.Store',{model: 'NextThought.model.Title'});
        this.addEvents({
            loaded : true
        });

        this.callParent(arguments);
        return this;
    },

    each: function(callback, scope){
        this.store.data.each(callback,scope||this);
    },

    
    getTitle: function(index){
        var title = null;

        this.each(function(t){
            if(t && t.get && t.get('index') == index) {
                title = t;
                return false;
            }
        });

        return title;
    },

    getToc: function(index){
    	if(index && !this._tocs[index]){
    		this._loadToc(index);
    	}
    	
    	return this._tocs[index];
    },
    
    
	load: function(){
        this.store.on('load', this._onLoad, this );
        this.store.load();
    },

    _onLoad: function(store, records, success, operation, opts) {

        if(success){
            this._libraryLoaded(Ext.bind(go,this));
        }
        else {
            if(NextThought.isDebug)
                console.log('FAILED: load library');

            alert('FAILED: load library');
            window.location.reload();
        }

        function go(){
			this.fireEvent('loaded',this);
		}
	},
	
	
	
    _libraryLoaded: function(callback){
		var me = this, stack = [];
	    //The reason for iteration 1 is to load the stack with the number of TOCs I'm going to load
		this.each(function(o){
			if(!o.get||!o.get('index')){ return; }
			stack.push(o.get('index'));
		});

        //Iteration 2 loads TOC async, so once the last one loads, callback if available
		this.each(function(o){
			if(!o.get||!o.get('index')){ return; }
			me._loadToc(o.get('index'), function(){
				stack.pop();
				if(stack.length==0 && callback){
					callback.call(this);
				}
			});
		});
	},
	
	
	_loadToc: function(index, callback){
        try{
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
        }
        catch(e){
            console.log('Error loading the TOC:',e, e.message, e.stack);
        }
	},
	
	_parseXML: function(txt) {
        try{
            if (window.DOMParser) {
                return new DOMParser().parseFromString(txt,"text/xml");
            }

            // Internet Explorer
            var x = new ActiveXObject("Microsoft.XMLDOM");
            x.async="false";
            x.loadXML(txt);
            return x;
        }
        catch(e){
            console.log('Could not parse xml for TOC');
        }

        return undefined;
	},

    findLocationTitle: function(containerId){
        var l = this.findLocation(containerId);
        return l? l.location.getAttribute('label') : 'Not found';
    },

    findLocation: function(containerId) {
        var result = null;

        this.each(function(o){
            result = this._resolveBookLocation(o, containerId);
            if (result) return false;
        }, this);

        return result;
    },

    _resolveBookLocation: function(book, containerId) {
        var l = Ext.DomQuery.selectNode("topic[ntiid="+containerId+"]", this.getToc(book.get('index')));
        if (l)
            return {book:book, location:l};

        return null;
    }
});