Ext.define('NextThought.Library', {
	singleton: true,
	mixins: { observable: 'Ext.util.Observable' },
	requires:[
		'NextThought.model.Title'
	],

	
	constructor: function(config) {
		this.tocs = {};
		this.addEvents({
			loaded : true
		});

		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
		return this;
	},


	getStore: function(){
		if(!this.store){
			var server = $AppConfig.server,
				service = $AppConfig.service,
				host = server.host;

			this.store = Ext.create('Ext.data.Store',{
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
		return this.store;
	},


	each: function(callback, scope){
		this.getStore().data.each(callback,scope||this);
	},


	getNavigationInfo: function(ntiid) {
		var loc = this.findLocation(ntiid),
			toc = loc? loc.toc : null,
			list = toc ? Ext.DomQuery.select('toc,topic' ,toc): [],
			i = 0,
			len = list.length,
			info = {};

		for (i; i < len; i++) {
			if (!list[i] || !list[i].tagName) {
				console.error('error in loop', ntiid, loc, list, i, len);
				continue;
			}

			if(list[i].getAttribute('ntiid') === ntiid) {
				info.hasPrevious = Boolean(info.previous = list[i - 1]);
				info.hasNext = !!(info.next = list[i + 1]);
				info.nextRef = info.hasNext ? info.next.getAttribute('ntiid') : null;
				info.previousRef = info.hasPrevious ? info.previous.getAttribute('ntiid') : null;
				info.current = list[i];
				break;
			}
		}

		return info;
	},


	getTitle: function(index){
		var title = null;

		this.each(function(t){
			if(t && t.get && t.get('index') === index) {
				title = t;
				return false;
			}
		});

		return title;
	},


	getToc: function(index){
		if(index instanceof Ext.data.Model){
			index = index.getId();
		}
		if(index && !this.tocs[index]){
			this.loadToc(index);
		}

		return this.tocs[index];
	},


	load: function(){
		this.loaded = false;
		this.getStore().on('load', this.onLoad, this );
		this.getStore().load();
	},


	onLoad: function(store, records, success) {
		function go(){
			this.loaded = true;
			this.fireEvent('loaded',this);
		}

		if(success){
			this.libraryLoaded(Ext.bind(go,this));
		}
		else {
			console.error('FAILED: load library');
		}
	},
	
	
	libraryLoaded: function(callback){
		var me = this, stack = [];
		//The reason for iteration 1 is to load the stack with the number of TOCs I'm going to load
		this.each(function(o){
			if(!o.get||!o.get('index')){ return; }
			stack.push(o.get('index'));
		});

		if(stack.length===0){
			callback.call(this);
			return;
		}

		//Iteration 2 loads TOC async, so once the last one loads, callback if available
		this.each(function(o){
			if(!o.get||!o.get('index')){ return; }
			me.loadToc(o.get('index'), function(toc){
				stack.pop();
				var d = toc.documentElement;
				o.set('NTIID',d.getAttribute('ntiid'));
				d.setAttribute('base', o.get('root'));
				d.setAttribute('icon', o.get('icon'));
				d.setAttribute('title', o.get('title'));
				if(stack.length===0 && callback){
					callback.call(this);
				}
			});
		});
	},
	
	
	loadToc: function(index, callback){
		try{
			var url = $AppConfig.server.host+index;
			Ext.Ajax.request({
				url: url,
				async: !!callback,
				scope: this,
				failure: function() {
					console.error('There was an error loading library', url, arguments);
				},
				success: function(r) {
					this.tocs[index] = r.responseXML? r.responseXML : this.parseXML(r.responseText);
					if(!this.tocs[index]){
						console.warn('no data for index: '+url);
					}

					var toRemove = Ext.DomQuery.select('topic:not([ntiid])', this.tocs[index]);
					Ext.each(toRemove, function(e){
						if (e.parentNode) {
							e.parentNode.removeChild(e);
						}
						else {
							console.error('no parent node?', e);
						}
					});

					if( callback ){
						callback(this.tocs[index]);
					}
				}
			});
		}
		catch(e){
			console.error('Error loading the TOC:',e, e.message, e.stack);
		}
	},
	

	parseXML: function(xml) {
		try{
			if (window.DOMParser) {
				return new DOMParser().parseFromString(xml,"text/xml");
			}

			// Internet Explorer
			var x = new ActiveXObject("Microsoft.XMLDOM");
			x.async="false";
			x.loadXML(xml);
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
			result = this.resolveLocation(this.getToc( o ), containerId);
			if (result) {
				return false;
			}
		}, this);

		return result;
	},


	isOrDecendantOf: function(parentId, potentialChild) {
		if (parentId === potentialChild) {
			return true;
		}

		var child = this.findLocation(potentialChild),
			l = child ? child.location : null,
			found = false,
			id;

		while(l && !found) {
			id = l.getAttribute? l.getAttribute('ntiid') : null;
			if (parentId === id){
				found = true;
			}
			l = l.parentNode;
		}

		return found;
	},


	getLineage: function(containerId){
		var leaf = this.findLocation(containerId) || {},
			node = leaf.location,
			lineage = [],
			id;

		while(node){
			id = node.getAttribute? node.getAttribute('ntiid') : null;
			if( id ) {
				lineage.push(id);
			}
			node = node.parentNode;
		}

		return lineage;
	},


	resolveLocation: function(toc, containerId) {
		if( toc.documentElement.getAttribute( 'ntiid' ) === containerId ) {
			return {toc:toc, location:toc.firstChild, NTIID: containerId, ContentNTIID: containerId};
		}
		return this.recursiveResolveLocation( containerId, toc );
	},


	recursiveResolveLocation: function recurse( containerId, elt ) {
		var elts = elt.getElementsByTagName( 'topic' ), ix, child, cr;
		for( ix = 0; ix < elts.length; ix++ ) {
			child = elts.item(ix);
			if( !child ) { continue; }
			if( child.getAttribute( 'ntiid' ) === containerId ) {
				return {
					toc: child.ownerDocument,
					location: child,
					NTIID: containerId,
					ContentNTIID: child.ownerDocument.documentElement.getAttribute('ntiid')
				};
			}

			cr = recurse( containerId, child );
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
