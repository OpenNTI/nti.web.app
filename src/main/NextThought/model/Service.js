Ext.define('NextThought.model.Service', {
	extend: 'NextThought.model.Base',
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
			l = this.getLinkFrom(w.Links||[], USER_SEARCH_REL);
		if(!l)
			return null;

		return _AppConfig.server.host + this._forceTrailingSlash(l) + (username?username:'');
	},


	getUserDataSearchURL: function(){
		var w = this.getCollection('Pages') || {},
			l = this.getLinkFrom(w.Links||[], USER_GENERATED_DATA_SEARCH_REL);

		if(!l)
			return null;

		return _AppConfig.server.host + this._forceTrailingSlash(l);
	},


	getSearchURL : function(containerId){
		var h = _AppConfig.server.host,
			c = containerId ? containerId : 'prealgebra';
		return h+'/'+c+'/Search/';
	},


	getQuizSubmitURL: function(ntiid){
		var h = _AppConfig.server.host,
			u = _AppConfig.username;

		return  h+'/dataserver/users/'+u+'/quizresults/'+ntiid;
	},


	_forceTrailingSlash: function(uri){
		if(uri.charAt(uri.length-1)==='/')
			return uri;

		return uri + '/';
	},


	getLinkFrom: function(links, rel){
		var i=links.length-1, o;
		for(;i>=0; i--){
			o = links[i] || {};
			if(o.rel == rel)
				return o.href;
		}

		return null;
	},


	getWorkspace: function(name){
		var items = this.get('Items') || [],
			i, workspace = null;

		for(i in items){
			if(!items.hasOwnProperty(i))continue;
			if(items[i].Title == name){
				workspace = items[i];
				break;
			}
		}

		return workspace;
	},


	getLibrary: function(name){
		var libs = this.getWorkspace('Library') || {},
			items = libs.Items || [],
			i, library = null;

		for(i in items){
			if(!items.hasOwnProperty(i))continue;
			if(items[i].Title == name){
				library = items[i];
				break;
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
				if(!items.hasOwnProperty(i))continue;
				item = items[i];

				if(Ext.Array.contains(item.accepts,mimeType)){
					if(title && item.Title != title) continue;

					collection = item;
					break;
				}
			}
			if (collection) return false;
		});

		return Ext.clone(collection);
	},


	getCollection: function(title, workspaceName){
		var workspace = this.getWorkspace(workspaceName || _AppConfig.username) || {},
			items = workspace.Items || [],
			i, item, collection = null;

		for(i in items){
			if(!items.hasOwnProperty(i))continue;
			item = items[i];

			if(item.Title == title){
				collection = item;
				break;
			}

		}

		return Ext.clone( collection );
	}

});
