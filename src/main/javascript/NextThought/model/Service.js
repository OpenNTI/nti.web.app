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


	getResolveUserURL: function(username){
		var w = this.getWorkspace('Global') || {},
			l = this.getLinkFrom(w.Links||[], Globals.USER_RESOLVE_REL);
		if(!l) {
			return null;
		}
		return getURL(this.forceTrailingSlash(l) + (username?encodeURIComponent(username):''));
	},


	getUserUnifiedSearchURL: function(){
		var w = this.getWorkspace($AppConfig.username) || {},
			l = this.getLinkFrom(w.Links||[], Globals.USER_UNIFIED_SEARCH_REL);

		if(!l) {
			return null;
		}

		return getURL(this.forceTrailingSlash(l));
	},


	forceTrailingSlash: function(uri){
		if(uri.charAt(uri.length-1)==='/') {
			return uri;
		}

		return uri + '/';
	},


	getLinkFrom: function(links, rel){
		var i=links.length-1, o;
		for(i;i>=0; i--){
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
						if(title && item.Title !== title) {
							continue;
						}

						collection = item;
						break;
					}
				}
			}
			return !Boolean(collection);
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


	getObjectURL: function(ntiid, field){
		var f = '';
		if (field) {
			f = Ext.String.format("/++fields++{0}", field);
		}

		return getURL(Ext.String.format("{0}/{1}{2}",
			this.getCollection('Objects', 'Global').href,
			encodeURIComponent(ntiid||''),
			f));
	},


	urlWithQueryParams: function(base, obj){
		if(!Ext.isObject(obj)){
			return base;
		}

		return [base, Ext.Object.toQueryString(obj)].join(base.indexOf('?') < 0 ? '?' : '&');
	},


	appendTypeView: function(base, type){
		return base + '/@@' + type;
	},




	getObjectRaw: function (url, mime, forceMime, success, failure, scope){
		var q = {}, headers = {};

		if(!url){
			Ext.callback(failure,scope, ['']);
			return null;
		}

		if(mime){
			headers.Accept = mime;
		}

		try{
			//lookup step
			q.request = Ext.Ajax.request({
				url: url,
				scope: scope,
				headers: headers,
				callback: function(req,s,resp){
					//If sent an Accept header the server
					//may return a 406 if the Accept value is not supported
					//or it may just return whatever it wants.  If we send
					//Accept we check the Content-Type to see if that is what
					//we get back.  If it's not and forceMime is truthy
					//we call the failure callback
					var href, contentType;
					if(s){
						if(mime && forceMime){
							contentType = resp.getResponseHeader('Content-Type');
							if(contentType && contentType.indexOf(mime) < 0){
								console.info('Requested with an explicit accept value of', mime, 'but got contenttype.  Calling failure', arguments);
								Ext.callback(failure, scope, [req, resp]);
								return;
							}
						}

						Ext.callback(success, scope, [resp]);
					} else {
						Ext.callback(failure, scope, [req, resp]);
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
		var url, q,
			mime = 'application/vnd.nextthought.pageinfo';

		if(!ParseUtils.parseNtiid(ntiid)){
			Ext.callback(failure,scope, ['']);
			return null;
		}

		url = this.getObjectURL(ntiid);

		//Chrome 25,26 and 27 (and safari 6) don't seem to listen to any of the caching
		//headers that would prevent a request for an object using one Accept
		//type from being cached and returned on a later request for the same object
		//with a different Accept header.  In this case it is very important we get PageInfo
		//objects back so request them at a special view to influence cache logic
		url = this.appendTypeView(url, 'pageinfo+json');

		try{

			function onSuccess(resp){
				pageInfos = ParseUtils.parseItems(resp.responseText);

				//We claim success but the damn browsers like to give the wrong object
				//type from cache.  They don't seem to listen to Vary: Accept or any
				//of the other myriad of caching headers supplied by the server
				pageInfo = pageInfos.first();
				if(pageInfo && pageInfo.get('MimeType') !== mime){
					console.warn('Received an unknown object when requesting PageInfo.  Treating as failure', resp);
					Ext.callback(failure, scope, [{}, resp]);
					return;
				}
				Ext.callback(success, scope, pageInfos);
			}

			function onFailure(req,resp){
				Ext.callback(failure,scope, [req,resp]);
			}


			q = this.getObjectRaw(url, mime+'+json', true, onSuccess, onFailure, this);

		}
		catch(e){
			Ext.callback(failure,scope,[{},e]);
		}

		return q;
	},


	getObject: function (ntiid, success, failure, scope, safe){
		var url;

		if(!ParseUtils.parseNtiid(ntiid)){
			Ext.callback(failure,scope, ['']);
			return null;
		}

		url = this.getObjectURL(ntiid);

		return this.getObjectRaw(url, null, false,
				function(resp){
					var arg;

					try{
						arg = ParseUtils.parseItems(resp.responseText);
					}catch(e){
						if(safe){
							Ext.callback(success, scope);
						}else{
							throw e;
						}
					}
					Ext.callback(success, scope, arg);
				},
				function(req,resp){
					Ext.callback(failure,scope, [req, resp]);
				},
				this
		);
	},



	/*
	 *	The following methods are for deciding when things can or cannot happen
	 */

    canUploadAvatar: function() {
        return this.hasCapability('nti.platform.customization.avatar_upload');
    },


	canBlog: function(){
		return this.hasCapability('nti.platform.blogging.createblogentry');
	},


	canChat: function() {
		return this.hasCapability('nti.platform.p2p.chat');
	},


	canShare: function(){
		return this.hasCapability('nti.platform.p2p.sharing');
	},


	canFriend: function(){
		return this.hasCapability('nti.platform.p2p.friendslists');
	},

	canHaveForum: function(){
		return this.hasCapability('nti.platform.forums.communityforums');
	},


	//Right now the cabability isn't enough so hack some crap in client
	//side which I'm sure will break terribly at some point.  Logic is
	//users with the capability and (those users that have no role field or a role field
	//not equal to student) should be allowed to create them.  The purpose
	//is to further restrict the capability for mathcounts users that are students
	//as specified by the unverified role field.
	//
	//Note this already breaks for coppa student accounts that get upgraded to none coppa
	//status.  Their role changs from student to other.
	canCreateDynamicGroups: function(){
		var roleField = $AppConfig.userObject.get('role');
		if(!this.hasCapability('nti.platform.p2p.dynamicfriendslists')){
			return false;
		}
		return !roleField || roleField.toLowerCase() !== 'student';
	},


	hasCapability: function(c){
		var caps = this.get('CapabilityList') || [];
		return Ext.Array.contains(caps, c);
	},


	canCanvasURL: function() {
		var coll = $AppConfig.service.getCollectionFor('application/vnd.nextthought.canvasurlshape', 'Pages');
		return !!coll;
	},


	//TODO - this is a temporary measure to prevent anyone other than nextthought employees or the 2 law professors access to share a redaction,
	//       until permissioning of actions can be accomplished.
	canShareRedaction: function(){
		var canShare =  /(@nextthought\.com$)|(^sehenderson@ou\.edu$)|(^stephen\.henderson@aya\.yale\.edu$)|(^thai@post\.harvard\.edu$)/.test($AppConfig.username);
		return canShare;
	},


	canRedact: function() {
		var coll = $AppConfig.service.getCollectionFor('application/vnd.nextthought.redaction', 'Pages');
		return !!coll;
	},


    isPotentiallyCoppa: function(){
        return (/mathcounts/i).test(window.location.hostname);
    },


	canWorkspaceBlog: function(){
		return Boolean($AppConfig.service.getCollection('Blog'));
	}

});
