

Ext.define('NextThought.Library', {
    singleton: true,
	mixins: { observable: 'Ext.util.Observable' },
	requires:[
        'NextThought.model.Title'
    ],

	
    constructor: function(config) {
		this._tocs = [];
        this.addEvents({
            loaded : true
        });

        this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
        return this;
    },

    getStore: function(){
		if(!this._store){
			var server = _AppConfig.server,
				service = _AppConfig.service,
				host = server.host;

			this._store = Ext.create('Ext.data.Store',{
				model: 'NextThought.model.Title',
				proxy: {
					type: 'ajax',
					headers: {
						'Accept': 'application/vnd.nextthought.collection+json',
						'Content-Type': 'application/json'
					},
					url : host + service.getMainLibrary().href,
					reader: {
						type: 'json',
						root: 'titles'
					}
				}
			});
		}
        return this._store;
    },

    each: function(callback, scope){
        this.getStore().data.each(callback,scope||this);
    },

    //TODO-consider caching the nav infos for some period of time to avoid extra work...
    getNavigationInfo: function(ntiid) {
        var loc = this.findLocation(ntiid),
            book = loc ? loc.book : null,
            root = book ? book.get('root') : '',
            toc = book ? this.getToc(book.get('index')) : null,
            list = toc ? Ext.DomQuery.select('toc,topic' ,toc): [],
            i = 0,
            len = list.length,
            info = {};

        for (i; i < len; i++) {
            if (!list[i] || !list[i].getAttribute) {
                console.error('error in loop', ntiid, loc, book, toc, list, i, len);
                continue;
            }

            if(list[i].getAttribute('ntiid') == ntiid) {
                info.hasPrevious = !!(info.previous = list[i - 1]);
                info.hasNext = !!(info.next = list[i + 1]);
                info.nextHref = info.hasNext ? root + info.next.getAttribute('href') : null;
                info.previousHref = info.hasPrevious ? root + info.previous.getAttribute('href') : null;
                info.current = list[i];
                info.book = book;
                break;
            }
        }

        return info;
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
        this.loaded = false;
        this.getStore().on('load', this._onLoad, this );
        this.getStore().load();
    },

    _onLoad: function(store, records, success) {

        if(success){
            this._libraryLoaded(Ext.bind(go,this));
        }
        else {
			console.error('FAILED: load library');
        }

        function go(){
            this.loaded = true;
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
				if(stack.length===0 && callback){
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
                    console.error('There was an error loading library', url, arguments);
                },
                success: function(r) {
                    this._tocs[index] = r.responseXML? r.responseXML : this._parseXML(r.responseText);
                    if(!this._tocs[index]){
                        console.warn('no data for index: '+url);
                    }

                    var toRemove = Ext.DomQuery.select('topic:not([ntiid])', this._tocs[index]);
                    Ext.each(toRemove, function(e){
                        if (e.parentNode)
                            e.parentNode.removeChild(e);
                        else
                            console.error('no parent node?', e);
                    });

                    if( callback ){
                        callback();
                    }
                }
            });
        }
        catch(e){
            console.error('Error loading the TOC:',e, e.message, e.stack);
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
            console.error('Could not parse xml for TOC');
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

    isOrDecendantOf: function(parentId, potentialChild) {
        if (parentId == potentialChild) return true;

        var child = this.findLocation(potentialChild),
            l = child ? child.location : null,
            found = false,
			id;

        while(l && !found) {
            id = l.getAttribute? l.getAttribute('ntiid') : null;
            if (parentId == id) found = true;
            l = l.parentNode;
        }

        return found;
    },

    _resolveBookLocation: function(book, containerId) {
        var toc = this.getToc( book.get( 'index' ) );
        if( toc.documentElement.getAttribute( 'ntiid' ) == containerId ) {
            return {book:book, location:toc};
        }
        return this._recursiveResolveBookLocation( book, containerId, toc );
    },

    _recursiveResolveBookLocation: function( book, containerId, elt ) {
        var elts = elt.getElementsByTagName( 'topic' ), ix, child, cr;
        for( ix = 0; ix < elts.length; ix++ ) {
            child = elts.item(ix);
            if( !child ) { continue; }
            if( child.getAttribute( 'ntiid' ) == containerId ) {
                return {book: book, location: child };
            }
            cr = this._recursiveResolveBookLocation( book, containerId, child );
            if( cr ) {
                return cr;
            }
        }
        return null;
    }

},
function(){
    window.Library = NextThought.Library;
}
);
