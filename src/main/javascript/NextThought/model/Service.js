Ext.define('NextThought.model.Service', {
	extend: 'NextThought.model.Base',
	requires: [
		'Ext.String'
	],
	idProperty: 'Class',
	fields: [
		{ name: 'Items', type: 'auto', defaultValue: {Items:[]}},
		{ name: 'Class', type: 'string', defaultValue: 'Service'},
		{ name: 'CapabilityList', type: 'auto'}
	],


	constructor: function(doc, user){
		var r = this.callParent([doc]);

		if(!this.getWorkspace(user)){
			console.error('Could not locate workspace for:', user);
			Ext.Error.raise('bad service doc');
		}

		return r;
	},

	getUserSearchURL: function(username){
		var w = this.getWorkspace('Global') || {},
			l = this.getLinkFrom(w.Links||[], Globals.USER_SEARCH_REL);
		if(!l) {
			return null;
		}
		return getURL(this.forceTrailingSlash(l) + (username?encodeURIComponent(username):''));
	},


	getUserDataSearchURL: function(){
		var w = this.getWorkspace($AppConfig.username) || {},
			l = this.getLinkFrom(w.Links||[], Globals.USER_GENERATED_DATA_SEARCH_REL);

		if(!l) {
			return null;
		}

		return getURL(this.forceTrailingSlash(l));
	},


	getUserUnifiedSearchURL: function(){
		var w = this.getWorkspace($AppConfig.username) || {},
			l = this.getLinkFrom(w.Links||[], Globals.USER_UNIFIED_SEARCH_REL);

		if(!l) {
			return null;
		}

		return getURL(this.forceTrailingSlash(l));
	},


	getSearchURL : function(containerId){
		var c = containerId ? containerId : 'prealgebra';
		return getURL('/'+c+'/Search/');
	},


	getQuizSubmitURL: function(ntiid){
		var u = $AppConfig.username;

		return  getURL('/dataserver/users/'+u+'/quizresults/'+ntiid);
	},


	forceTrailingSlash: function(uri){
		if(uri.charAt(uri.length-1)==='/') {
			return uri;
		}

		return uri + '/';
	},


	getLinkFrom: function(links, rel){
		var i=links.length-1, o;
		for(;i>=0; i--){
			o = links[i] || {};
			if(o.rel === rel) {
				return o.href;
			}
		}

		return null;
	},


	getWorkspace: function(name){
		var items = this.get('Items') || [],
			i, workspace = null;

		for(i in items){
			if(items.hasOwnProperty(i)) {
				if(items[i].Title === name){
					workspace = items[i];
					break;
				}
			}
		}

		return workspace;
	},


	getLibrary: function(name){
		var libs = this.getWorkspace('Library') || {},
			items = libs.Items || [],
			i, library = null;

		for(i in items){
			if(items.hasOwnProperty(i)) {
				if(items[i].Title === name){
					library = items[i];
					break;
				}
			}
		}

		return library;
	},


	getMainLibrary: function(){
		return this.getLibrary('Main') || {};
	},


	/**
	 *
	 * @param mimeType
	 * @param [title]
	 */
	getCollectionFor: function(mimeType, title){
		var collection = null;

		Ext.each(this.get('Items') || [], function(workspace){
			var items = workspace.Items || [],
				i, item;

			for(i in items){
				if(items.hasOwnProperty(i)) {
					item = items[i];

					if(Ext.Array.contains(item.accepts,mimeType)){
						if(title && item.Title !== title) { continue; }

						collection = item;
						break;
					}
				}
			}
			if (collection) {
				return false;
			}
		});

		return Ext.clone(collection);
	},


	getCollection: function(title, workspaceName){
		var workspace = this.getWorkspace(workspaceName || $AppConfig.username) || {},
			items = workspace.Items || [],
			i, item, collection = null;

		for(i in items){
			if(items.hasOwnProperty(i)) {
				item = items[i];

				if(item.Title === title){
					collection = item;
					break;
				}
			}

		}

		return Ext.clone( collection );
	},


	resolveTopContainer: function resolve(containerId, success, failure, scope){

		var o = LocationProvider.find(containerId),
			me = scope || this;

		function step(container){
			return resolve(
					container.get('ContainerId'),
					success,
					failure,
					me);
		}

		if(o){
			return Ext.callback(success,null,[o]);
		}

		me.getObject(containerId, step, failure, me);
	},


	getObjectURL: function(ntiid, field){
		var f = '';
		if (field) {
			f = Ext.String.format("/++fields++{0}", field);
		}

		return getURL(Ext.String.format("{0}/{1}{2}",
			this.getCollection('Objects', 'Global').href,
			encodeURIComponent(ntiid),
			f));
	},


	getObjectRaw: function (ntiid, success, failure, scope){
		var url = this.getObjectURL(ntiid),
			q = {};

		if(!ParseUtils.parseNtiid(ntiid)){
			Ext.callback(failure,scope, ['']);
			return;
		}

		function continueRequest(resolvedUrl){
			try {
				q.request = Ext.Ajax.request({
					url: resolvedUrl,
					scope: scope,
					callback: function(req, s, resp){
						if(s){
							resp.responseLocation = resolvedUrl;
							Ext.callback(success, scope, [resp]);
						} else {
							Ext.callback(failure,scope, [req,resp]);
						}
					}
				});
			}
			catch(e){
				Ext.callback(failure,scope,[{},e]);
			}
		}

		try{
			//lookup step
			q.request = Ext.Ajax.request({
				url: url,
				scope: scope,
				headers: {
					Accept: 'application/vnd.nextthought.link+json'
				},
				callback: function(req,s,resp){
					var href;
					if(s){
						href = Ext.JSON.decode(resp.responseText).href;
						continueRequest(getURL(href));
					} else {
						Ext.callback(failure,scope, [req,resp]);
					}
				}
			});
		}
		catch(e){
			Ext.callback(failure,scope,[{},e]);
		}

		return q;
	},


	getPageInfo: function(ntiid, success, failure, scope){
			var url = this.getObjectURL(ntiid),
				q = {};

			if(!ParseUtils.parseNtiid(ntiid)){
				Ext.callback(failure,scope, ['']);
				return;
			}

			try{
				//lookup step
				q.request = Ext.Ajax.request({
					url: url,
					scope: scope,
					headers: {
						Accept: 'application/vnd.nextthought.pageinfo+json'
					},
					callback: function(req,s,resp){
						var pageInfos;
						if(s){
							pageInfos = ParseUtils.parseItems(resp.responseText);
							Ext.callback(success, scope, pageInfos);
						} else {
							Ext.callback(failure,scope, [req,resp]);
						}
					}
				});
			}
			catch(e){
				Ext.callback(failure,scope,[{},e]);
			}

			return q;
		},



	getObject: function (ntiid, success, failure, scope){
		return this.getObjectRaw(ntiid,
				function(resp){
					Ext.callback(success, scope, ParseUtils.parseItems(resp.responseText));
				},
				function(req,resp){
					Ext.callback(failure,scope, [req,resp]);
				},
				this
		);
	},


	/* The following methods are for deciding when things can or cannot happen*/
	canChat: function() {
		return this.hasCapability('nti.platform.p2p.chat');
	},


	canShare: function(){
		return this.hasCapability('nti.platform.p2p.sharing');
	},


	hasCapability: function(c){
		var caps = this.get('CapabilityList') || [];
		return Ext.Array.contains(caps, c);
	},


	canCanvasURL: function() {
		var coll = $AppConfig.service.getCollectionFor('application/vnd.nextthought.canvasurlshape', 'Pages');
		return !!coll;
	},


	canRedact: function() {
		var coll = $AppConfig.service.getCollectionFor('application/vnd.nextthought.redaction', 'Pages');
		return !!coll;
	}
});
