const Ext = require('@nti/extjs');
const { getService } = require('@nti/web-client');
const Globals = require('internal/legacy/util/Globals');
const lazy = require('internal/legacy/util/lazy-require')
	.get('UserDataActions', () =>
		require('internal/legacy/app/userdata/Actions')
	)
	.get('ParseUtils', () => require('internal/legacy/util/Parsing'));

const Community = require('./Community');

require('internal/legacy/model/Base');
require('internal/legacy/model/PageInfo');

const { guidGenerator, getURL } = Globals;

module.exports = exports = Ext.define('NextThought.model.Service', {
	extend: 'NextThought.model.Base',
	idProperty: 'Class',

	fields: [
		{ name: 'Items', type: 'auto', defaultValue: { Items: [] } },
		{ name: 'Class', type: 'string', defaultValue: 'Service' },
		{ name: 'SiteCommunity', type: 'string' },
		{ name: 'CapabilityList', type: 'auto' },
	],

	request: function (urlOrConfig) {
		var cfg = {};
		let returnResponse = false;

		if (urlOrConfig && !Ext.isString(urlOrConfig)) {
			returnResponse = urlOrConfig.returnResponse;

			delete urlOrConfig.returnResponse;
		}

		const { stack } = Error();
		return new Promise(function (fulfill, reject) {
			function resolve(q, s, r) {
				var value = r.responseText;
				if (!s) {
					const asPlain = txt => {
						try {
							return JSON.parse(txt).message;
						} catch (e) {
							let d = document.createElement('div');
							d.innerHTML = txt;
							return (d.innerText || d.textContent || '').trim();
						}
					};

					// no "new" allows use to make the error, but not break on it in the debugger,
					// nor will sentry report it (unless thrown) (theory based on the error built on line 38 not getting reported)
					const e = Error(
						`${r.status}: ${r.statusText}\n${asPlain(
							r.responseText
						)}`
					);
					reject(
						Object.assign(e, r, {
							stack:
								e.stack +
								'\n' +
								String(stack).split('\n').slice(1).join('\n'),
							status: r.status,
						})
					);
					return;
				}

				if (q.method === 'HEAD' || returnResponse) {
					value = r;
				}

				fulfill(value);
			}

			if (Ext.isString(urlOrConfig)) {
				Ext.apply(cfg, { url: urlOrConfig });
			} else {
				Ext.apply(cfg, urlOrConfig);
			}

			cfg.callback = Ext.Function.createSequence(
				resolve,
				cfg.callback,
				null
			);

			Ext.Ajax.request(cfg);
		});
	},

	requestDelete: function (url) {
		return this.request({ url: url, method: 'DELETE' });
	},

	post: function (urlOrConfig, data) {
		var config;
		if (Ext.isString(urlOrConfig)) {
			config = {
				url: urlOrConfig,
			};
		} else {
			config = urlOrConfig;
		}

		config.method = 'POST';
		config.jsonData = config.jsonData || data;

		return this.request(config);
	},

	postMultiPartData(url, data, onProgress) {
		const me = this;

		return new Promise(function (fulfill, reject) {
			let xhr = me.__buildXHR(url, 'POST', onProgress, fulfill, reject);

			xhr.send(data);
		});
	},

	putMultiPartData(url, data, onProgress) {
		const me = this;

		return new Promise(function (fulfill, reject) {
			let xhr = me.__buildXHR(url, 'PUT', onProgress, fulfill, reject);

			xhr.send(data);
		});
	},

	__buildXHR(url, method, onProgress, success, failure) {
		let xhr = new XMLHttpRequest(),
			progress = onProgress ? onProgress.bind(this) : () => {};

		xhr.open(method || 'POST', url, true);
		xhr.setRequestHeader('accept', 'application/json');
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		xhr.upload.addEventListener('progress', progress);
		xhr.upload.addEventListener('load', progress);

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					success(xhr.responseText);
				} else {
					failure({
						status: xhr.status,
						responseText: xhr.responseText,
					});
				}
			}
		};

		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		return xhr;
	},

	postAndExit: function (url, data) {
		var id = guidGenerator(),
			tpl = new Ext.XTemplate(
				Ext.DomHelper.markup({
					tag: 'form',
					id: id,
					action: url,
					method: 'POST',
					cn: {
						tag: 'tpl',
						foreach: '.',
						cn: {
							tag: 'input',
							type: 'hidden',
							name: '{$}',
							value: '{.}',
						},
					},
				})
			);

		tpl.append(Ext.getBody(), data).submit();
	},

	put: function (url, data) {
		return this.request({
			url: url,
			method: 'PUT',
			jsonData: data,
		});
	},

	getUserSearchURL: function (username) {
		var w = this.getWorkspace('Global') || {},
			l = this.getLinkFrom(w.Links || [], Globals.USER_SEARCH_REL);
		if (!l) {
			return null;
		}
		return getURL(
			this.forceTrailingSlash(l) +
				(username ? encodeURIComponent(username) : '')
		);
	},

	getResolveUserURL: function (username) {
		var w = this.getWorkspace('Global') || {},
			l = this.getLinkFrom(w.Links || [], Globals.USER_RESOLVE_REL);
		if (!l) {
			return null;
		}

		return getURL(
			this.forceTrailingSlash(l) +
				(username ? encodeURIComponent(username) : '')
		);
	},

	getBulkResolveUserURL: function () {
		var w = this.getWorkspace('Global') || {},
			l = this.getLinkFrom(w.Links || [], Globals.BULK_USER_RESOLVE_REL);
		if (!l) {
			return null;
		}

		return getURL(this.forceTrailingSlash(l));
	},

	getHighlightColors: function () {
		return [
			{ name: 'yellow', color: 'EDE619' },
			{ name: 'green', color: '4CE67F' },
			{ name: 'blue', color: '3FB3F6' },
			{ name: 'blackout', color: '000000' },
		];
	},

	getUserUnifiedSearchURL: function () {
		var w = this.getWorkspace($AppConfig.username) || {},
			l = this.getLinkFrom(
				w.Links || [],
				Globals.USER_UNIFIED_SEARCH_REL
			);

		if (!l) {
			return null;
		}

		return getURL(this.forceTrailingSlash(l));
	},

	getPurchasableItemURL: function () {
		//Until we get this hung off some workspace
		return getURL('/dataserver2/store/get_purchasables');
	},

	getStoreActivationURL: function () {
		return getURL('/dataserver2/store/redeem_purchase_code');
	},

	forceTrailingSlash: function (uri) {
		if (uri.charAt(uri.length - 1) === '/') {
			return uri;
		}

		return uri + '/';
	},

	getLinkFrom: function (links, rel) {
		var i = links.length - 1,
			o;
		for (i; i >= 0; i--) {
			o = links[i] || {};
			if (o.rel === rel) {
				return o.href;
			}
		}

		return null;
	},

	getWorkspace: function (name) {
		var items = this.get('Items') || [],
			i,
			workspace = null;

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

	getWorkspaceLink(name, rel) {
		const workspace = this.getWorkspace(name);

		return (
			workspace &&
			workspace.Links &&
			this.getLinkFrom(workspace.Links, rel)
		);
	},

	getLibrary: function (name) {
		var libs = this.getWorkspace('Library') || {},
			items = libs.Items || [],
			i,
			library = null;

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

	getMainLibrary: function () {
		return this.getLibrary('Main') || {};
	},

	/**
	 *
	 * @param {string} mimeType MimeType
	 * @param {string} [title] Title
	 * @returns {Object} The collection
	 */
	getCollectionFor: function (mimeType, title) {
		var collection = null;

		Ext.each(this.get('Items') || [], function (workspace) {
			var items = workspace.Items || [],
				i,
				item;

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

	getCollection: function (title, workspaceName) {
		var workspace =
				this.getWorkspace(workspaceName || $AppConfig.username) || {},
			items = workspace.Items || [],
			i,
			item,
			collection = null;

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

	getObjectURL: function (ntiid, field) {
		var f = '',
			collection = this.getCollection('Objects', 'Global') || {};
		if (field) {
			f = Ext.String.format('/++fields++{0}', field);
		}

		return getURL(
			Ext.String.format(
				'{0}/{1}{2}',
				collection.href || '',
				encodeURIComponent(ntiid || ''),
				f
			)
		);
	},

	getContainerUrl: function (ntiid, type) {
		var pid = 'Pages(' + ntiid + ')',
			u = $AppConfig.userObject.get('href').split('?')[0];

		return getURL(
			Ext.String.format(
				'{0}/{1}/{2}',
				u,
				encodeURIComponent(pid || ''),
				type || ''
			)
		);
	},

	urlWithQueryParams: function (base, obj) {
		if (!Ext.isObject(obj)) {
			return base;
		}

		return [base, Ext.Object.toQueryString(obj)].join(
			base.indexOf('?') < 0 ? '?' : '&'
		);
	},

	getObjectRaw: function (url, mime, forceMime, targetBundle) {
		var headers = {},
			opts = {},
			params = { type: mime };

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

		return new Promise(function (fulfill, reject) {
			var request = {
				url: url,
				headers: headers,
				callback: function (req, s, resp) {
					var reason, contentType;
					//If sent an Accept header the server
					//may return a 406 if the Accept value is not supported
					//or it may just return whatever it wants.	If we send
					//Accept we check the Content-Type to see if that is what
					//we get back.	If it's not and forceMime is truthy
					//we call the failure callback
					if (s) {
						if (mime && forceMime) {
							contentType =
								resp.getResponseHeader('Content-Type');
							if (contentType && contentType.indexOf(mime) < 0) {
								reason =
									'Requested with an explicit accept value of ' +
									mime +
									' but got ' +
									contentType +
									'.	Rejecting.';
								console.error(reason, arguments);
								return reject(reason);
							}
						}

						return fulfill(resp);
					}
					reject([req, resp]);
				},
			};

			Ext.apply(request, opts);
			Ext.Ajax.request(request);
		});
	},

	dropPageInfosForPrefix: function (prefix) {
		var url = this.getObjectURL(prefix),
			k,
			o = this.pageInfoCache;

		for (k in o) {
			if (o.hasOwnProperty(k)) {
				if (Ext.String.startsWith(k, url, true)) {
					delete o[k];
				}
			}
		}
	},

	FAKE_PUBLISH_COMMUNITY_NAME: 'client:publish',

	getFakePublishCommunity: function () {
		if (!this.__fakePublishCommunity) {
			this.__fakePublishCommunity = Community.create({
				Username: this.FAKE_PUBLISH_COMMUNITY_NAME,
				alias: 'Public',
			});
		}

		return this.__fakePublishCommunity;
	},

	isFakePublishCommunity: function (community) {
		community = community.isModel ? community.get('Username') : community;

		return community === this.FAKE_PUBLISH_COMMUNITY_NAME;
	},

	getGroupsMap: function () {
		if (this.__loadUserGroups) {
			return this.__loadUserGroups;
		}

		var collection = this.getCollection('Groups'),
			href = collection && collection.href;

		if (!href) {
			return Promise.resolve([]);
		}

		this.__loadUserGroups = Service.request(href).then(function (response) {
			var json = JSON.parse(response),
				items = json.Items,
				keys = Object.keys(items) || [];

			keys.forEach(function (key) {
				items[key] = lazy.ParseUtils.parseItems(items[key])[0];
			});

			return json.Items;
		});

		return this.__loadUserGroups;
	},

	getCommunitiesMap: function () {
		if (this.__loadUserCommunities) {
			return this.__loadUserCommunities;
		}

		var collection = this.getCollection('Communities'),
			href = collection && collection.href;

		if (!href) {
			return Promise.resolve([]);
		}

		this.__loadUserCommunities = Service.request(href).then(function (
			response
		) {
			var json = JSON.parse(response),
				items = json.Items,
				keys = Object.keys(items) || [];

			keys.forEach(function (key) {
				items[key] = lazy.ParseUtils.parseItems(items[key])[0];
			});

			return items;
		});

		return this.__loadUserCommunities;
	},

	getGroupsList: function () {
		return this.getGroupsMap().then(function (items) {
			var keys = Object.keys(items);

			return keys.map(function (key) {
				return items[key];
			});
		});
	},

	getCommunitiesList: function () {
		return this.getCommunitiesMap().then(function (items) {
			var keys = Object.keys(items);

			return keys.map(function (key) {
				return items[key];
			});
		});
	},

	getPageInfo: function (ntiid, success, failure, scope, targetBundle) {
		var url,
			me = this,
			cache = (me.pageInfoCache = me.pageInfoCache || {}),
			params = targetBundle ? { course: targetBundle.getId() } : {},
			mime = 'application/vnd.nextthought.pageinfo';

		if (!lazy.ParseUtils.isNTIID(ntiid)) {
			Ext.callback(failure, scope, ['']);
			return Promise.reject(
				new Error(`Bad PageInfo NTIID: ${JSON.stringify(ntiid)}`)
			);
		}

		if (!cache.listeningForInvalidations) {
			cache.listeningForInvalidations = Ext.Ajax.on({
				destroyable: true,
				beforerequest: function (connection, options) {
					var method = options.method,
						uri =
							options.url &&
							options.url.replace(
								/\/\+\+fields\+\+sharingPreference$/,
								''
							);

					if (method !== 'GET' && cache[uri]) {
						console.debug('Invalidate cache at url' + uri);
						delete cache[uri];
					}
				},
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
			var pageInfos = lazy.ParseUtils.parseItems(resp.responseText),
				//We claim success but the damn browsers like to give the wrong object
				//type from cache.	They don't seem to listen to Vary: Accept or any
				//of the other myriad of caching headers supplied by the server
				pageInfo = pageInfos.first();

			if (pageInfo && pageInfo.get('MimeType') !== mime) {
				console.warn(
					'Received an unknown object when requesting PageInfo.	Treating as failure',
					resp
				);
				return Promise.reject([{}, resp]);
			}

			pageInfos.forEach(function (p) {
				(p || {}).originalNTIIDRequested = ntiid;
			});

			me.UserDataActions =
				me.UserDataActions || lazy.UserDataActions.create();

			me.UserDataActions.updatePreferences(pageInfos);
			Ext.callback(success, scope, pageInfos); //back-compat
			return pageInfo;
		}

		function onFailure(reason) {
			if (!Ext.isArray(reason)) {
				reason = [reason];
			}
			reason[0].ntiid = ntiid;
			Ext.callback(failure, scope, reason); //back-compat
			//don't let this 'catch' the failure...let the promise continue to reject.
			return Promise.reject(reason[1] || reason[0]);
		}

		// function cacheWrapper (resp) {
		// 	if (resp.status === 200) {
		// 		try {
		// 			ObjectUtils.deleteFunctionProperties(cache[url] = Ext.clone(resp));
		// 		} catch (e) {
		// 			console.error('(IE9?) Error occured trying to cache the pageInfo response. ' + e.stack || e.message);
		// 		}
		// 	} else {
		// 		console.debug('Not caching response because it wasn\'t a 200', resp);
		// 	}
		// 	return resp;
		// }

		// if (cache.hasOwnProperty(url)) {
		//	return wait(1).then(onSuccess.bind(this, cache[url]));//make this call from its own stack
		// }

		return (
			this.getObjectRaw({ url: url, ntiid: ntiid }, mime + '+json', true)
				// .then(cacheWrapper)
				.then(onSuccess)
				.catch(onFailure)
		);
	},

	getPathToObjectLink: function (id) {
		var collection = this.getCollection('LibraryPath', 'Global'),
			url = collection && collection.href,
			params = {
				ObjectId: id,
			};

		if (!url) {
			return '';
		}

		url += '?' + Ext.Object.toQueryString(params);

		return url;
	},

	getObjectOfType(ntiid, mime, forceMime, targetBundle) {
		const url = this.getObjectURL(ntiid);

		return this.getObjectRaw(url, mime, forceMime, targetBundle)
			.then(resp => {
				return lazy.ParseUtils.parseItems(resp.responseText)[0];
			})
			.catch(() => {
				return;
			});
	},

	getObject: function (ntiid, success, failure, scope, safe, targetBundle) {
		var result;

		if (!lazy.ParseUtils.isNTIID(ntiid)) {
			Ext.callback(failure, scope, ['']);
			return Promise.reject(
				new Error(`Bad Object NTIID: ${JSON.stringify(ntiid)}`)
			);
		}

		result = getService()
			.then(service => service.getObjectURL(ntiid))
			.then(url => this.getObjectRaw(url, null, false, targetBundle))
			.then(resp => {
				try {
					return lazy.ParseUtils.parseItems(resp.responseText)[0];
				} catch (e) {
					if (!safe) {
						throw e;
					}
				}
			});

		//for backwards compat. Deprecate the callbacks.
		result
			.then(function (o) {
				Ext.callback(success, scope, [o]);
			})
			.catch(function (reason) {
				if (!Ext.isArray(reason)) {
					reason = [reason];
				}
				Ext.callback(failure, scope, reason);
			});

		return result;
	},

	getObjectWithinBundle: function (ntiid, bundle) {
		return this.getObject(ntiid, null, null, null, false, bundle);
	},

	getObjects: function (ntiids, success, failure, scope, safe) {
		var me = this;
		if (!Ext.isArray(ntiids)) {
			ntiids = [ntiids];
		}

		function model(o) {
			return o && o.isModel ? o : null;
		}

		return Promise.all(
			ntiids.map(function (n) {
				return me.getObject(n, null, null, null, safe);
			})
		).always(function (results) {
			if (!Ext.isArray(results)) {
				results = [results];
			}
			results = results.map(model);
			Ext.callback(success, scope, [results]);
			return results;
		});
	},

	__resolveBoards: function (link, community) {
		return Service.request(link)
			.then(lazy.ParseUtils.parseItems.bind(lazy.ParseUtils))
			.then(function (objs) {
				//if we have a community go ahead and set it as the creator of the board it created
				//otherwise just return the boards as is
				if (!community) {
					return objs;
				}

				return objs.map(function (o) {
					o.communityUsername = community.getId();

					if (o.get('Creator') === community.getId()) {
						o.set('Creator', community);
					}

					return o;
				});
			});
	},

	getRootBoardLink: function () {
		var collection = this.getCollection('Boards', $AppConfig.username),
			links = collection && collection.Links,
			link = links && this.getLinkFrom(links, 'global.site.board');

		return link;
	},

	resolveRootBoards: function () {
		var me = this,
			rootLink = me.getRootBoardLink(),
			communities;

		if (rootLink) {
			return me.__resolveBoards(rootLink);
		}

		communities = $AppConfig.userObject.getCommunities();

		return Promise.all(
			communities.map(function (community) {
				var url = community.getLink('DiscussionBoard');

				if (!url) {
					return Promise.resolve([]);
				}

				return me.__resolveBoards(url, community);
			})
		).then(function (results) {
			return results.reduce(function (a, b) {
				return a.concat(b);
			}, []);
		});
	},

	//#region capability shortcuts
	/*
	 *	The following methods are for deciding when things can or cannot happen
	 */

	canUploadAvatar: function () {
		return this.hasCapability('nti.platform.customization.avatar_upload');
	},

	canBlog: function () {
		return this.hasCapability('nti.platform.blogging.createblogentry');
	},

	canChat: function () {
		return this.hasCapability('nti.platform.p2p.chat');
	},

	canShare: function () {
		return this.hasCapability('nti.platform.p2p.sharing');
	},

	canFriend: function () {
		return this.hasCapability('nti.platform.p2p.friendslists');
	},

	canHaveForum: function () {
		return this.hasCapability('nti.platform.forums.communityforums');
	},

	canChangePassword: function () {
		return this.hasCapability(
			'nti.platform.customization.can_change_password'
		);
	},

	//Removed crazy filter logic after consoluting Greg and Jason on 1/16/2014. -cutz
	canCreateDynamicGroups: function () {
		return this.hasCapability('nti.platform.p2p.dynamicfriendslists');
	},

	canDoAdvancedEditing: function () {
		return this.hasCapability('nti.platform.courseware.advanced_editing');
	},

	hasCapability: function (c) {
		var caps = this.get('CapabilityList') || [];
		return Ext.Array.contains(caps, c);
	},

	canCanvasURL: function () {
		var coll = Service.getCollectionFor(
			'application/vnd.nextthought.canvasurlshape',
			'Pages'
		);
		return !!coll;
	},

	canEmbedVideo: function () {
		var coll = Service.getCollectionFor(
			'application/vnd.nextthought.embeddedvideo',
			'Pages'
		);
		return !!coll;
	},

	canShareRedaction: function () {
		return false;
	},

	canRedact: function () {
		var coll = Service.getCollectionFor(
			'application/vnd.nextthought.redaction',
			'Pages'
		);
		return !!coll;
	},

	//#endregion
	canWorkspaceBlog: function () {
		return Boolean(Service.getCollection('Blog'));
	},
});
