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


	getTitle: function(index){
		var title = null;

		if(index instanceof Ext.data.Model){
			index = index.getId();
		}

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
					this.tocs[index] = this.parseXML(r.responseText);
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
			return new DOMParser().parseFromString(xml,"text/xml");
		}
		catch(e){
			console.error('Could not parse xml for TOC');
		}

		return undefined;
	},

	/**
	 * TODO: move to NextThought.providers.Location
	 */
	findLocationTitle: function(containerId){
		var l = this.findLocation(containerId);
		return l? l.location.getAttribute('label') : 'Not found';
	},

	/**
	 * TODO: move to NextThought.providers.Location
	 */
	findLocation: function(containerId) {
		var result = null;
		this.each(function(o){
			result = this.resolveLocation(this.getToc( o ), this.getTitle(o), containerId);
			if (result) {
				return false;
			}
		}, this);

		return result;
	},

	/**
	 * TODO: move to NextThought.providers.Location
	 */
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

	/**
	 * TODO: move to NextThought.providers.Location
	 */
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

	/**
	 * TODO: move to NextThought.providers.Location
	 */
	resolveLocation: function(toc, title, containerId) {
		if( toc.documentElement.getAttribute( 'ntiid' ) === containerId ) {
			return {toc:toc, location:toc.documentElement, NTIID: containerId, ContentNTIID: containerId, title: title};
		}
		return this.recursiveResolveLocation( containerId, toc, title);
	},

	/**
	 * TODO: move to NextThought.providers.Location
	 */
	recursiveResolveLocation: function recurse( containerId, elt, title ) {
		var elts = elt.getElementsByTagName( 'topic' ), ix, child, cr;
		for( ix = 0; ix < elts.length; ix++ ) {
			child = elts.item(ix);
			if( !child ) { continue; }
			if( child.getAttribute( 'ntiid' ) === containerId ) {
				return {
					toc: child.ownerDocument,
					location: child,
					NTIID: containerId,
					title: title,
					ContentNTIID: child.ownerDocument.documentElement.getAttribute('ntiid')
				};
			}

			cr = recurse( containerId, child, title );
			if( cr ) {
				return cr;
			}
		}
		return null;
	}

},
function(){
	window.Library = this;
}
);
