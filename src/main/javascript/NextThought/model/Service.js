Ext.define('NextThought.model.Service', {
	extend: 'NextThought.model.Base',
	requires: [
		'Ext.String'
	],
	idProperty: 'Class',
	fields: [
		{ name: 'Items', type: 'auto', defaultValue: {Items:[]}},
		{ name: 'Class', type: 'string', defaultValue: 'Service'}
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

		return $AppConfig.server.host + this.forceTrailingSlash(l) + (username?username:'');
	},


	getUserDataSearchURL: function(){
		var w = this.getCollection('Pages') || {},
			l = this.getLinkFrom(w.Links||[], Globals.USER_GENERATED_DATA_SEARCH_REL);

		if(!l) {
			return null;
		}

		return $AppConfig.server.host + this.forceTrailingSlash(l);
	},


	getUserUnifiedSearchURL: function(){
		var w = this.getCollection('Pages') || {},
			l = this.getLinkFrom(w.Links||[], Globals.USER_UNIFIED_SEARCH_REL);

		if(!l) {
			return null;
		}

		return $AppConfig.server.host + this.forceTrailingSlash(l);
	},


	getSearchURL : function(containerId){
		var h = $AppConfig.server.host,
			c = containerId ? containerId : 'prealgebra';
		return h+'/'+c+'/Search/';
	},


	getQuizSubmitURL: function(ntiid){
		var h = $AppConfig.server.host,
			u = $AppConfig.username;

		return  h+'/dataserver/users/'+u+'/quizresults/'+ntiid;
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

		var o = Library.findLocation(containerId),
			me = scope || this;

		function step(container){
			return resolve(
					container.get('ContainerId'),
					success,
					failure,
					me);
		}

		if(o){
			return Globals.callback(success,null,[o]);
		}

		me.getObject(containerId, step, failure, me);
	},


	getObjectRaw: function (ntiid, success, failure, scope){
		var host = $AppConfig.server.host,
			url = Ext.String.format("{0}{1}/{2}",
				host,
				this.getCollection('Objects', 'Global').href,
				encodeURIComponent(ntiid)
			),
			q = {};

		if(!ParseUtils.parseNtiid(ntiid)){
			Globals.callback(failure,scope, ['']);
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
							Globals.callback(success, scope, [resp]);
						} else {
							Globals.callback(failure,scope, [req,resp]);
						}
					}
				});
			}
			catch(e){
				Globals.callback(failure,scope,[{},e]);
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
						continueRequest(host+href);
					} else {
						Globals.callback(failure,scope, [req,resp]);
					}
				}
			});
		}
		catch(e){
			Globals.callback(failure,scope,[{},e]);
		}

		return q;
	},


	getObject: function (ntiid, success, failure, scope){
		return this.getObjectRaw(ntiid,
				function(resp){
					Globals.callback(success, scope, ParseUtils.parseItems(resp.responseText));
				},
				function(req,resp){
					Globals.callback(failure,scope, [req,resp]);
				},
				this
		);
	}

});
