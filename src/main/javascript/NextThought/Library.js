Ext.define('NextThought.Library', {
	singleton: true,
	mixins: { observable: 'Ext.util.Observable' },
	requires:[
		'Ext.data.Store',
		'NextThought.model.Title',
		'NextThought.proxy.JSONP',
		'NextThought.util.Base64'
	],

	bufferedToc: {},

	constructor: function(config) {
		this.tocs = {};
		this.addEvents({
			loaded : true
		});

		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
		return this;
	},


	getFirstPage: function(){
		var first = this.getStore().getAt(0);

		if(first){
			return first.get('NTIID');
		}

		return null;
	},


	getStore: function(){
		if(!this.store){
			var service = $AppConfig.service;

			this.store = new Ext.data.Store({
				id: 'library',
				model: 'NextThought.model.Title',
				proxy: {
					type: 'ajax',
					headers: {
						'Accept': 'application/vnd.nextthought.collection+json',
						'Content-Type': 'application/json'
					},
					url : getURL(service.getMainLibrary().href),
					reader: {
						type: 'json',
						root: 'titles'
					}
				},
				sorters: [{sorterFn: function(a, b){
							   if(/nextthought/i.test(a.get('author'))){
								   return 1;
							   }
							   if(/nextthought/i.test(b.get('author'))){
								   return -1;
							   }
							   return 0;
						   }},
						  {property: 'title', direction: 'asc'}]
			});
		}
		return this.store;
	},


	each: function(callback, scope){
		this.getStore().each(callback,scope||this);
	},


	getTitle: function(index){
		var field = 'index';

		if(index instanceof Ext.data.Model){
			index = index.getId();
		}
		else if(ParseUtils.parseNtiid(index) !== null){
			field = 'NTIID';
		}

		return this.getStore().findRecord(field, index, 0, false, true, true);
	},


	getToc: function(index){
		if(index instanceof Ext.data.Model){
			index = index.getId();
		}
		if(index && !this.tocs[index]){
			console.error('we should never be here...');
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
		var me = this, stack = [], store = this.getStore(), url, toRemove = [];
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
			if(!o.get||!o.get('index')||($AppConfig.server.jsonp&&!o.get('index_jsonp'))){
				toRemove.push(o);
				stack.pop(); return;
			}
			url = $AppConfig.server.jsonp ? o.get('index_jsonp') : o.get('index');
			me.loadToc(o.get('index'), url, o.get('NTIID'), function(toc){
				var d;
				stack.pop();

				if(!toc){
					console.log('Could not load "'+ o.get('index')+'"... removing form library view');
					store.remove(o);
				}
				else {
					d = toc.documentElement;
					o.set('NTIID',d.getAttribute('ntiid'));
					d.setAttribute('base', o.get('root'));
					d.setAttribute('icon', o.get('icon'));
					d.setAttribute('title', o.get('title'));
				}

				if(stack.length===0 && callback){
					callback.call(this);
				}
			});
		});

		this.getStore().remove(toRemove);
	},


	loadToc: function(index, url, ntiid, callback){
		var proxy = Ext.Ajax;
		if(!this.loaded && !callback){
			Ext.Error.raise('The library has not loaded yet, should not be making a synchronous call');
		}

		function fn(q,s,r){
			var xml;

			function strip(e){ Ext.fly(e).remove(); }

			delete this.tocs[index];

			if(s){
				xml = this.tocs[index] = this.parseXML(r.responseText);
				if(xml){
					Ext.each(Ext.DomQuery.select('topic:not([ntiid]),topic:not([thumbnail])', xml), strip);
				}
				else {
					console.warn('no data for index: '+url);
				}
			}
			else {
				console.error('There was an error loading part of the library: '+url, arguments);
			}

			Ext.callback(callback,this,[xml]);
		}




		try{
			url = getURL(url);
			if($AppConfig.server.jsonp){
				proxy = JSONP;
			}
			proxy.request({
				ntiid: ntiid,
				jsonpUrl: url,
				url: url,
				expectedContentType: 'text/xml',
				async: !!callback,
				scope: this,
				callback: fn
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


	resolve: function(toc, title, containerId) {
		if( toc.documentElement.getAttribute( 'ntiid' ) === containerId ) {
			return {toc:toc, location:toc.documentElement, NTIID: containerId, ContentNTIID: containerId, title: title};
		}
		return this.recursiveResolve( containerId, toc, title);
	},


	recursiveResolve: function recurse( containerId, elt, title ) {
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
});
