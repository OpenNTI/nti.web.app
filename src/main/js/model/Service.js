export default Ext.define('NextThought.model.Service', {
	extend: 'NextThought.model.Base',
	idProperty: 'Class',

	requires: [
		'NextThought.model.PageInfo',
		'NextThought.app.userdata.Actions'
	],

	fields: [
		{ name: 'Items', type: 'auto', defaultValue: {Items: []}},
		{ name: 'Class', type: 'string', defaultValue: 'Service'},
		{ name: 'SiteCommunity', type: 'string'},
		{ name: 'CapabilityList', type: 'auto'}
	],


	request: function(urlOrConfig) {
		var cfg = {};

		return new Promise(function(fulfill, reject) {
			function resolve(q, s, r) {
				var value = r.responseText;
				if (!s) {
					reject(r);
					return;
				}

				if (q.method === 'HEAD') {
					value = r;
				}

				fulfill(value);
			}

			if (Ext.isString(urlOrConfig)) {
				Ext.apply(cfg, {url: urlOrConfig});
			} else {
				Ext.apply(cfg, urlOrConfig);
			}

			cfg.callback = Ext.Function.createSequence(resolve, cfg.callback, null);

			Ext.Ajax.request(cfg);
		});
	},


	requestDelete: function(url) {
		return this.request({url: url, method: 'DELETE'});
	},


	post: function(urlOrConfig, data) {
		var config;
		if (Ext.isString(urlOrConfig)) {
			config = {
				url: urlOrConfig
			};
		} else {
			config = urlOrConfig;
		}

		config.method = 'POST';
		config.jsonData = config.jsonData || data;

		return this.request(config);
	},


	postAndExit: function(url, data) {
		var id = guidGenerator(),
			tpl = new Ext.XTemplate(
				Ext.DomHelper.markup({tag: 'form', id: id, action: url, method: 'POST', cn: {
					tag: 'tpl', foreach: '.', cn: {tag: 'input', type: 'hidden', name: '{$}', value: '{.}'}}}));

		tpl.append(Ext.getBody(), data).submit();
	},


	put: function(url, data) {
		return this.request({
			url: url,
			method: 'PUT',
			jsonData: data
		});
	},


	getUserSearchURL: function(username) {
		var w = this.getWorkspace('Global') || {},
			l = this.getLinkFrom(w.Links || [], Globals.USER_SEARCH_REL);
		if (!l) {
			return null;
		}
		return getURL(this.forceTrailingSlash(l) + (username ? encodeURIComponent(username) : ''));
	},


	getResolveUserURL: function(username) {
		var w = this.getWorkspace('Global') || {},
			l = this.getLinkFrom(w.Links || [], Globals.USER_RESOLVE_REL);
		if (!l) {
			return null;
		}

		return getURL(this.forceTrailingSlash(l) + (username ? encodeURIComponent(username) : ''));
	},


	getBulkResolveUserURL: function() {
		var w = this.getWorkspace('Global') || {},
			l = this.getLinkFrom(w.Links || [], Globals.BULK_USER_RESOLVE_REL);
		if (!l) {
			return null;
		}

		return getURL(this.forceTrailingSlash(l));
	},

	getHighlightColors: function() {
		return [
			{name: 'yellow', color: 'EDE619'},
			{name: 'green', color: '4CE67F'},
			{name: 'blue', color: '3FB3F6'}
		];
	},

	getUserUnifiedSearchURL: function() {
		var w = this.getWorkspace($AppConfig.username) || {},
			l = this.getLinkFrom(w.Links || [], Globals.USER_UNIFIED_SEARCH_REL);

		if (!l) {
			return null;
		}

		return getURL(this.forceTrailingSlash(l));
	},


	getPurchasableItemURL: function() {
		//Until we get this hung off some workspace
		return getURL('/dataserver2/store/get_purchasables');
	},


	getStoreActivationURL: function() {
		return getURL('/dataserver2/store/redeem_purchase_code');
	},


	forceTrailingSlash: function(uri) {
		if (uri.charAt(uri.length - 1) === '/') {
			return uri;
		}

		return uri + '/';
	},


	getLinkFrom: function(links, rel) {
		var i = links.length - 1, o;
		for (i; i >= 0; i--) {
			o = links[i] || {};
			if (o.rel === rel) {
				return o.href;
			}
		}

		return null;
	},


	getWorkspace: function(name) {
		var items = this.get('Items') || [],
			i, workspace = null;

		for (i in items) {
			if (items.hasOwnProperty(i)) {
				if (items[i].Title === name) {
					workspace = items[i];
					break;
				}
			}
		}

		return workspace;
	},


	getLibrary: function(name) {
		var libs = this.getWorkspace('Library') || {},
			items = libs.Items || [],
			i, library = null;

		for (i in items) {
			if (items.hasOwnProperty(i)) {
				if (items[i].Title === name) {
					library = items[i];
					break;
				}
			}
		}

		return library;
	},


	getMainLibrary: function() {
		return this.getLibrary('Main') || {};
	},


	/**
	 *
	 * @param {String} mimeType
	 * @param {String} [title]
	 */
	getCollectionFor: function(mimeType, title) {
		var collection = null;

		Ext.each(this.get('Items') || [], function(workspace) {
			var items = workspace.Items || [],
				i, item;

			for (i in items) {
				if (items.hasOwnProperty(i)) {
					item = items[i];

					if (Ext.Array.contains(item.accepts, mimeType)) {
						if (title && item.Title !== title) {
							continue;
						}

						collection = item;
						break;
					}
				}
			}
			return !collection;
		});

		return Ext.clone(collection);
	},


	getCollection: function(title, workspaceName) {
		var workspace = this.getWorkspace(workspaceName || $AppConfig.username) || {},
			items = workspace.Items || [],
			i, item, collection = null;

		for (i in items) {
			if (items.hasOwnProperty(i)) {
				item = items[i];

				if (item.Title === title) {
					collection = item;
					break;
				}
			}

		}

		return Ext.clone(collection);
	},


	getObjectURL: function(ntiid, field) {
		var f = '',
			collection = this.getCollection('Objects', 'Global') || {};
		if (field) {
			f = Ext.String.format('/++fields++{0}', field);
		}

		return getURL(Ext.String.format('{0}/{1}{2}',
			collection.href || '',
			encodeURIComponent(ntiid || ''),
			f));
	},


	getContainerUrl: function(ntiid, type) {
		var pid = 'Pages(' + ntiid + ')',
			u = $AppConfig.userObject.get('href').split('?')[0];

		return getURL(Ext.String.format('{0}/{1}/{2}', u, encodeURIComponent(pid || ''), type || ''));
	},


	urlWithQueryParams: function(base, obj) {
		if (!Ext.isObject(obj)) {
			return base;
		}

		return [base, Ext.Object.toQueryString(obj)].join(base.indexOf('?') < 0 ? '?' : '&');
	},


	getObjectRaw: function(url, mime, forceMime, targetBundle) {
		var headers = {}, opts = {},
			params = {type: mime};

		if (!url || (Ext.isObject(url) && !url.url)) {
			return Promise.reject('No URL');
		}

		if (mime) {
			headers.Accept = mime;
		}

		if (Ext.isObject(url)) {
			opts = url;
			url = opts.url;
		}

		if (targetBundle) {
			params.course = targetBundle.getId();
		}

		url = Ext.String.urlAppend(url, Ext.Object.toQueryString(params));

		return new Promise(function(fulfill, reject) {
			var req = {
				url: url,
				headers: headers,
				callback: function(req, s, resp) {
					var reason, contentType;
					//If sent an Accept header the server
					//may return a 406 if the Accept value is not supported
					//or it may just return whatever it wants.  If we send
					//Accept we check the Content-Type to see if that is what
					//we get back.  If it's not and forceMime is truthy
					//we call the failure callback
					if (s) {
						if (mime && forceMime) {
							contentType = resp.getResponseHeader('Content-Type');
							if (contentType && contentType.indexOf(mime) < 0) {
								reason = 'Requested with an explicit accept value of ' + mime + ' but got ' + contentType + '.  Rejecting.';
								console.error(reason, arguments);
								return reject(reason);
							}
						}

						return fulfill(resp);
					}
					reject([req, resp]);
				}
			};

			Ext.apply(req, opts);
			Ext.Ajax.request(req);
		});
	},


	dropPageInfosForPrefix: function(prefix) {
		var url = this.getObjectURL(prefix),
				k, o = this.pageInfoCache;

		for (k in o) {
			if (o.hasOwnProperty(k)) {
				if (Ext.String.startsWith(k, url, true)) {
					delete o[k];
				}
			}
		}
	},


	FAKE_PUBLISH_COMMUNITY_NAME: 'client:publish',


	getFakePublishCommunity: function() {
		if (!this.__fakePublishCommunity) {
			this.__fakePublishCommunity = NextThought.model.Community.create({
				Username: this.FAKE_PUBLISH_COMMUNITY_NAME,
				alias: 'Public'
			});
		}

		return this.__fakePublishCommunity;
	},


	isFakePublishCommunity: function(community) {
		community = community.isModel ? community.get('Username') : community;

		return community === this.FAKE_PUBLISH_COMMUNITY_NAME;
	},


	getGroupsMap: function() {
		if (this.__loadUserGroups) { return this.__loadUserGroups; }

		var collection = this.getCollection('Groups'),
			href = collection && collection.href;

		if (!href) {
			return Promise.resolve([]);
		}

		this.__loadUserGroups = Service.request(href)
			.then(function(response) {
				var json = JSON.parse(response),
					items = json.Items,
					keys = Object.keys(items) || [];

				keys.forEach(function(key) {
					items[key] = ParseUtils.parseItems(items[key])[0];
				});

				return json.Items;
			});

		return this.__loadUserGroups;
	},


	getCommunitiesMap: function() {
		if (this.__loadUserCommunities) { return this.__loadUserCommunities; }

		var collection = this.getCollection('Communities'),
			href = collection && collection.href;

		if (!href) {
			return Promise.resolve([]);
		}

		this.__loadUserCommunities = Service.request(href)
			.then(function(response) {
				var json = JSON.parse(response),
					items = json.Items,
					keys = Object.keys(items) || [];

				keys.forEach(function(key) {
					items[key] = ParseUtils.parseItems(items[key])[0];
				});

				return items;
			});

		return this.__loadUserCommunities;
	},


	getGroupsList: function() {
		return this.getGroupsMap()
			.then(function(items) {
				var keys = Object.keys(items);

				return keys.map(function(key) {
					return items[key];
				});
			});
	},


	getCommunitiesList: function() {
		return this.getCommunitiesMap()
			.then(function(items) {
				var keys = Object.keys(items);

				return keys.map(function(key) {
					return items[key];
				});
			});
	},


	getPageInfo: function(ntiid, success, failure, scope, targetBundle) {
		var url, me = this,
			cache = me.pageInfoCache = me.pageInfoCache || {},
			params = targetBundle ? { course: targetBundle.getId() } : {},
			mime = 'application/vnd.nextthought.pageinfo';

		if (!ParseUtils.isNTIID(ntiid)) {
			Ext.callback(failure, scope, ['']);
			return Promise.reject('Bad NTIID');
		}

		if (!cache.listeningForInvalidations) {
			cache.listeningForInvalidations = Ext.Ajax.on({
				destroyable: true,
				beforerequest: function(connection, options) {
					var method = options.method,
						url = options.url && options.url.replace(/\/\+\+fields\+\+sharingPreference$/, '');

					if (method !== 'GET' && cache[url]) {
						console.debug('Invalidate cache at url' + url);
						delete cache[url];
					}
				}
			});
		}

		url = me.getObjectURL(ntiid);

		params = Ext.Object.toQueryString(params);

		if (params) {
			url = Ext.String.urlAppend(url, params);
		}

		//Chrome 25,26 and 27 (and safari 6) don't seem to listen to any of the caching
		//headers that would prevent a request for an object using one Accept
		//type from being cached and returned on a later request for the same object
		//with a different Accept header.  In this case it is very important we get PageInfo
		//objects back so request them at a special view to influence cache logic
		//url = this.appendTypeView(url, 'pageinfo+json');


		function onSuccess(resp) {
			var pageInfos = ParseUtils.parseItems(resp.responseText),
				//We claim success but the damn browsers like to give the wrong object
				//type from cache.  They don't seem to listen to Vary: Accept or any
				//of the other myriad of caching headers supplied by the server
				pageInfo = pageInfos.first();

			if (pageInfo && pageInfo.get('MimeType') !== mime) {
				console.warn('Received an unknown object when requesting PageInfo.  Treating as failure', resp);
				return Promise.reject([{}, resp]);
			}

			pageInfos.forEach(function(p) { (p || {}).originalNTIIDRequested = ntiid; });

			me.UserDataActions = me.UserDataActions || NextThought.app.userdata.Actions.create();

			me.UserDataActions.updatePreferences(pageInfos);
			Ext.callback(success, scope, pageInfos);//back-compat
			return pageInfo;
		}


		function onFailure(reason) {
			if (!Ext.isArray(reason)) {
				reason = [reason];
			}
			reason[0].ntiid = ntiid;
			Ext.callback(failure, scope, reason);//back-compat
			//don't let this 'catch' the failure...let the promise continue to reject.
			return Promise.reject(reason[1] || reason[0]);
		}


		function cacheWrapper(resp) {
			if (resp.status === 200) {
				try {
					ObjectUtils.deleteFunctionProperties(cache[url] = Ext.clone(resp));
				} catch (e) {
					console.error('(IE9?) Error occured trying to cache the pageInfo response. ' + e.stack || e.message);
				}
			} else {
				console.debug('Not caching response because it wasn\'t a 200', resp);
			}
			return resp;
		}


		// if (cache.hasOwnProperty(url)) {
		// 	return wait(1).then(onSuccess.bind(this, cache[url]));//make this call from its own stack
		// }

		return this.getObjectRaw({url: url, ntiid: ntiid}, mime + '+json', true)
				// .then(cacheWrapper)
				.then(onSuccess)
				.fail(onFailure);
	},


	getPathToObjectLink: function(id) {
		var collection = this.getCollection('LibraryPath', 'Global'),
			url = collection && collection.href,
			params = {
				ObjectId: id
			};

		if (!url) {
			return '';
		}

		url += '?' + Ext.Object.toQueryString(params);

		return url;
	},


	getObject: function(ntiid, success, failure, scope, safe, targetBundle) {
		var url, result;

		if (!ParseUtils.isNTIID(ntiid)) {
			Ext.callback(failure, scope, ['']);
			return Promise.reject('Bad NTIID');
		}

		url = this.getObjectURL(ntiid);

		result = this.getObjectRaw(url, null, false, targetBundle)
				.then(function(resp) {
					try {
						return ParseUtils.parseItems(resp.responseText)[0];
					}catch (e) {
						if (!safe) {
							throw e;
						}
					}
				});


		//for backwards compat. Deprecate the callbacks.
		result
				.then(function(o) {
					Ext.callback(success, scope, [o]);
				})
				.fail(function(reason) {
					if (!Ext.isArray(reason)) {
						reason = [reason];
					}
					Ext.callback(failure, scope, reason);
				});

		return result;
	},


	getObjects: function(ntiids, success, failure, scope, safe) {
		var me = this;
		if (!Ext.isArray(ntiids)) {
			ntiids = [ntiids];
		}

		function model(o) {
			return o && o.isModel ? o : null;
		}

		return Promise.all(ntiids.map(function(n) {
			return me.getObject(n, null, null, null, safe);
		}))
				.always(function(results) {
					if (!Ext.isArray(results)) {results = [results];}
					results = results.map(model);
					Ext.callback(success, scope, [results]);
					return results;
				});

	},


	getSupportLinks: function() {
		var aboutLink = getString('NextThought.view.menus.Settings.about.href', null, true) || 'http://nextthought.com';
		var supportEmailLink = getString('NextThought.view.menus.Settings.supportEmail', null, true) || null;

		this.supportLinks = this.supportLinks || {};

		return Ext.applyIf(this.supportLinks, {
			about: aboutLink,
			termsOfService: 'about:blank',
			supportEmail: supportEmailLink
		});
	},

	overrideServiceLink: function(link, value) {
		var o = {}; o[link] = value || undefined;
		this.supportLinks = Ext.apply(this.supportLinks || {}, o);
	},


	__resolveBoards: function(link, community) {
		return Service.request(link)
				.then(ParseUtils.parseItems.bind(ParseUtils))
				.then(function(objs) {
					//if we have a community go ahead and set it as the creator of the board it created
					//otherwise just return the boards as is
					if (!community) {
						return objs;
					}

					return objs.map(function(o) {
						o.communityUsername = community.getId();

						if (o.get('Creator') === community.getId()) {
							o.set('Creator', community);
						}

						return o;
					});
				});
	},


	getRootBoardLink: function() {
		var collection = this.getCollection('Boards', $AppConfig.username),
			links = collection && collection.Links,
			link = links && this.getLinkFrom(links, 'global.site.board');

		return link;
	},


	resolveRootBoards: function() {
		var me = this,
			rootLink = me.getRootBoardLink(),
			communities;

		if (rootLink) {
			return me.__resolveBoards(rootLink);
		}

		communities = $AppConfig.userObject.getCommunities();

		return Promise.all(communities.map(function(community) {
			var url = community.getLink('DiscussionBoard');

			if (!url) {
				return Promise.resolve([]);
			}

			return me.__resolveBoards(url, community);
		})).then(function(results) {
			return results.reduce(function(a, b) { return a.concat(b); }, []);
		});
	},


	//region capability shortcuts
	/*
		 *	The following methods are for deciding when things can or cannot happen
		 */

	canUploadAvatar: function() {
		return this.hasCapability('nti.platform.customization.avatar_upload');
	},


	canBlog: function() {
		return this.hasCapability('nti.platform.blogging.createblogentry');
	},


	canChat: function() {
		return this.hasCapability('nti.platform.p2p.chat');
	},


	canShare: function() {
		return this.hasCapability('nti.platform.p2p.sharing');
	},


	canFriend: function() {
		return this.hasCapability('nti.platform.p2p.friendslists');
	},

	canHaveForum: function() {
		return this.hasCapability('nti.platform.forums.communityforums');
	},

	canChangePassword: function() {
		return this.hasCapability('nti.platform.customization.can_change_password');
	},

	//Removed crazy filter logic after consoluting Greg and Jason on 1/16/2014. -cutz
	canCreateDynamicGroups: function() {
		return this.hasCapability('nti.platform.p2p.dynamicfriendslists');
	},


	canDoAdvancedEditing: function() {
		return this.hasCapability('nti.platform.courseware.advanced_editing');
	},


	hasCapability: function(c) {
		var caps = this.get('CapabilityList') || [];
		return Ext.Array.contains(caps, c);
	},


	canCanvasURL: function() {
		var coll = Service.getCollectionFor('application/vnd.nextthought.canvasurlshape', 'Pages');
		return !!coll;
	},


	canEmbedVideo: function() {
		var coll = Service.getCollectionFor('application/vnd.nextthought.embeddedvideo', 'Pages');
		return !!coll;
	},


	canShareRedaction: function() {
		return false;
	},


	canRedact: function() {
		var coll = Service.getCollectionFor('application/vnd.nextthought.redaction', 'Pages');
		return !!coll;
	},


	canWorkspaceBlog: function() {
		return Boolean(Service.getCollection('Blog'));
	}
	//endregion

});
