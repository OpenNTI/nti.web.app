var Ext = require('extjs');
var LocationMeta = require('../../cache/LocationMeta');
var UserRepository = require('../../cache/UserRepository');
var FilterManager = require('../../filter/FilterManager');
var Anchors = require('../../util/Anchors');
var AnnotationUtils = require('../../util/Annotations');
var ContentUtils = require('../../util/Content');
var Globals = require('../../util/Globals');
var ObjectUtils = require('../../util/Object');
var ParseUtils = require('../../util/Parsing');
var SharingUtils = require('../../util/Sharing');
var StoreUtils = require('../../util/Store');
var CommonActions = require('../../common/Actions');
var LoginStateStore = require('../../login/StateStore');
var UserdataStateStore = require('./StateStore');
var GroupsStateStore = require('../groups/StateStore');
var StorePageItem = require('../../store/PageItem');
var FilterFilterManager = require('../../filter/FilterManager');
var ModelBookmark = require('../../model/Bookmark');
var AnchorablesContentRangeDescription = require('../../model/anchorables/ContentRangeDescription');
var ContextStateStore = require('../context/StateStore');
var UtilAnchors = require('../../util/Anchors');
var UtilAnnotations = require('../../util/Annotations');
var DefinitionWindow = require('../contentviewer/components/definition/Window');
var ReaderAnchorResolver = require('../mediaviewer/components/reader/AnchorResolver');


module.exports = exports = Ext.define('NextThought.app.userdata.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function() {
		this.callParent(arguments);

		this.UserDataStore = NextThought.app.userdata.StateStore.getInstance();
		this.GroupsStore = NextThought.app.groups.StateStore.getInstance();
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();

		var store = this.UserDataStore;

		if (window.Service && !store.loading && !store.hasFinishedLoad) {
			this.onLogin();
		} else if (!window.Service) {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},

	onLogin: function() {
		var socket = this.UserDataStore.getSocket();

		socket.register({
			'data_noticeIncomingChange': this.onIncomingChange.bind(this)
		});

		this.UserDataStore.setLoaded();
	},

	changeActionMap: {
		/**
		 * Stubs that show what we could handle. They will be called with these args:
		 *
		 *	  @param {Object/Ext.data.Model} change the change record.
		 *	  @param {Object/Ext.data.Model} item Item the change is about.
		 *	  @param {Object} meta Location meta data
		 *
		 * these are assigned in the init() above
		 */
		created: 'incomingCreatedChange',
		deleted: 'incomingDeletedChange',
		modified: 'incomingModifiedChange',
		shared: 'incomingSharedChange'
	},

	/*
		TODO: make this subscription based on the container id, so a store can say give me all
		incoming changes with this container id and we only apply those changes to that store
		instead of iterating all of them
	 */
	onIncomingChange: function withMeta(change, meta, reCalled) {
		//fancy callback that calls this function back with additional arguments
		function reCall(meta) {
			var c = ParseUtils.parseItems([change.raw])[0];
			withMeta.call(me, c, meta, true);
		}


		//we require at least one change object
		if (!change) {
			console.error('Invalid Argument for change');
			return;
		}

		//if this is the raw json from the event, parse it.
		if (!change.isModel) {
			change = ParseUtils.parseItems([change])[0];
		}

		var me = this,
			item = change.getItem(),
			cid = change.getItemValue('ContainerId'),
			type = (change.get('ChangeType') || '').toLowerCase(),//ensure lowercase
			fn;

		//only call this on the first call
		if (!reCalled) {
			this.UserDataStore.fireEvent('incomingChange', change);
		}

		//I don't think we need this, doesn't look like any of the change handlers use it
		// //callback with our self, only if we haven't already and there is a containerId to resolve
		// if (!meta && !reCalled && cid) {
		//	LocationMeta.getMeta(cid, reCall, me);
		//	return;
		// }

		try {
			//Now that all the data is in order, lets dole out the responsibility to changeType specific functions
			fn = this.changeActionMap[type];

			if (this[fn]) {
				this[fn].call(this, change, item);
			}
		} catch (e) {
			console.error(Globals.getError(e));
		}
	},

	incomingCreatedChange: function(change, item) {
		var cid = item.get('ContainerId'),
			actedOn = false,
			recordForStore = item;

		this.UserDataStore.applyToStoresThatWantItem(function(id, store) {
			if (store) {
				actedOn = true;
				console.log(store, cid);

				if (store.findRecord('NTIID', item.get('NTIID'), 0, false, true, true)) {
					console.warn('Store already has item with id:' + item.get('NTIID'), item);
				}

				if (!recordForStore) {
					//Each store gets its own copy of the record. A null value indicates we already added one to a store
					//so we need a new instance. Read it out of the original raw value.
					recordForStore = ParseUtils.parseItems([item.raw])[0];
				}

				//The store will handle making all the threading/placement, etc
				store.add(recordForStore);
				//once added, null out this pointer so that subsequent loop iterations don't read the same instance
				//to another store.	 (I don't think our threading algorithm would appreciate that)
				recordForStore = null;
			}
		}, item);

		if (!actedOn) {
			console.warn('We did not act on this created change event:', change);
		}
	},

	incomingDeletedChange: function(change, item) {
		var cid = item.get('ContainerId'),
			actedOn = false;

		this.UserDataStore.applyToStoresThatWantItem(function(id, store) {
			var r;

			if (store) {
				actedOn = true;
				console.log(store, cid);
				r = store.findRecord('NTIID', item.get('NTIID'), 0, false, true, true);

				if (!r) {
					console.warn('Could not remove, the store did not have item with id:', + item.get('NTIID'), item);
					return;
				}

				//The store will handle making it a placeholder if it needs and fire events, etc... this is all we need to do.
				store.remove(r);
			}
		}, item);

		if (!actedOn) {
			console.warn('We did not act on this deleted change event:', change);
		}
	},

	incomingModifiedChange: function(change, item) {
		var cid = item.get('ContainerId'),
			actedOn = false;

		this.UserDataStore.applyToStoresThatWantItem(function(id, store) {
			var r;

			if (store) {
				actedOn = true;
				console.log(store, cid);

				r = store.findRecord('NTIID', item.get('NTIID'), 0, false, true, true);

				if (!r) {
					console.warn('Store already has item with id: ' + item.get('NTIID'), item);
					store.add(item);
					return;
				}

				//apply all the values of the new item to the existing one
				r.set(item.asJSON());
				r.fireEvent('updated', r);
				r.fireEvent('changed');
			}
		}, item);

		if (!actedOn) {
			console.warn('We did not act on this modified event:', change);
		}
	},

	incomingSharedChange: function(change, item) {
		console.warn('What would we do here? treating as a create.');
		this.incomingCreatedChange(change, item);
	},

	updatePreferences: function(pageInfo) {
		if (Array.isArray(pageInfo)) {
			pageInfo.map(this.updatePreferences.bind(this));
			return;
		}

		var sharing = pageInfo.get('sharingPreference'),
			pageInfoId = pageInfo.getId(),
			rootId = pageInfo.get('ContentPackageNTIID');

		if (sharing && /inherited/i.test(sharing.State) && rootId === sharing.Provenance) {
			//got a sharing value from the root id, add it to the map
			pageInfoId = rootId;
		} else if (!sharing || (!/set/i.test(sharing.State) && pageInfoId !== rootId)) {
			return;
		}

		this.UserDataStore.setPreference(pageInfoId, {sharing: sharing});

		if (sharing && sharing.sharedWith) {
			// Let's pre-resolve the users that are part of the default sharing list.
			// By the time, we look it up, it should be in the userRepository cache, if it's resolvable.
			UserRepository.getUser(sharing.sharedWith);
		}
	},

	__getPreferenceFromLineage: function(ntiids) {
		if (!ntiids) { return Promise.reject('No id to get preference for.'); }

		var store = this.UserDataStore,
			lineage = (ntiids && ntiids[0]) || [],
			preferenceOrPageInfo = lineage.map(function(id) {
				//if we have it cached return that, else call Service.getPageInfo which will get the
				//page info and cache the sharing prefs on this.preferenceMap
				return store.getPreference(id) || Service.getPageInfo.bind(Service, id);
			});

		if (preferenceOrPageInfo.length === 0) {
			return Promise.resolve(null);
		}

		return Promise.first(preferenceOrPageInfo)
			.then(function(p) {
				if (p.isPageInfo) {
					return store.getPreference[p.getId()] || {sharing: p.get('sharingPreference')};
				}

				return p;
			});
	},

	/**
	* Returns preferences for the given ntiid.	Currently this functions primary responsibility is
	* to determine the intial sharedWith list that userdata (new notes) should have the sharedWith list
	* defaulted to.
	*
	* Details on determing a ntiids default sharedWith.	 This piggy backs off of the original sharingPreferneces
	* that the server has long been sending back as part of the PageInfo, with some additional steps/complications
	* to make the sharing default to something sane(?) for both open and for credit students when in the context
	* of a course.
	*
	* The current business logic is as follows.	 In the context of a book use whatever the content default is,
	* or whatever the user has overriden it to.	 For a course, students enrolled for credit should default to
	* the for credit dfl unless they have changed the default.	In courses, open users default to whatever public means for that
	* course unless they have changed the default..	 I don't think this business logic will make sense at even
	* the next step forward in formalizing CourseInstances so we should revist both the current business logic and implementation
	* at that point in time.
	*
	* Meeting the business case for the books and content is currently done using the same implementation.
	* This is possible because we piggy back on some of the implementation details of how the communities and dfls are setup
	* for legacy community based courses.  Obviously this level of coupling to implementation details is extermely fragile.
	* This is one place where moving things further into the server can help immensly.	That will come with time.
	*
	* We start with the sharingPreferences, which by default for course content packages are configured to be the for credit dfl.
	* Given the list of default entites we then attempt to validate it.	 The list of entities is valid iff we can resolve all
	* usernames/ntiids in it to Entities (users, friendslists, dfls, or communities) AND entites that are friendslists, dfls, or communities
	* are in our set of friendslists, dfls, communities we own or are a member of.	If the sharedWith list is found to be valid, we use it
	* as is.  If the default sharing entites are found to be invalid or if we never found the default sharingPreferences to begin with,
	* we default to whatever 'public' means for the 'title' this ntiid belong to.  Note: this last detail also has assumptions
	* baked in around one content package per course, and the lack of cross content/course references.	When we have courses
	* references books external to their content package this will break.
	*
	*
	* @param {String} ntiid
	* @return {Object} An object encasuplating the prefences for the given ntiid.  Sharing related preferences are found beneath
	* the 'sharing' key
	*/
	getPreferences: function(ntiid, bundle) {
		if (!ntiid) {
			return Promise.reject('No id.');
		}

		var flStore = this.GroupsStore.getFriendsList();

		return ContentUtils.getLineage(ntiid, bundle)
			.then(this.__getPreferenceFromLineage.bind(this))
			.then(function(result) {
				var sharingIsValid = result && !Ext.isEmpty(result.sharing);

				if (sharingIsValid) {
					(result.sharing.sharedWith || []).every(function(id) {
						var entity = UserRepository.resolveFromStore(id),
							found;

						if (!entity) {
							sharingIsValid = false;
						} else {
							//If its not a user its a fl, or dfl we have to have it in
							//the fl store.	 If its a community it would need to be in	our
							//community list
							if (entity.isFriendsList) {
								if (!flStore.getById(entity.getId())) {
									sharingIsValid = false;
								}
							} else if (entity.isCommunity) {
								found = false;
								$AppConfig.userObject.getCommunities().every(function(com) {
									if (com.getId() === entity.getId()) {
										found = true;
									}

									return !found;
								});

								sharingIsValid = found;
							}
						}

						return sharingIsValid;
					});
				}

				if (!result || !sharingIsValid) {
					// if we have no sharing prefs, default to the public scope
					// or we can't resolve the sharing, the use public scope.
					return Promise[bundle ? 'resolve' : 'reject'](bundle)
						.then(function(ci) {
							return {sharing: {sharedWith: ci.getDefaultSharing()}};
						})
						.fail(function() {
							return {sharing: {}};
						});
				}

				return result;
			});
	},

	listenToPageStores: function(monitor, listeners) {
		var context = this.UserDataStore.getContext(monitor) || this.UserDataStore.getMainReaderContext();

		monitor.mon(context.pageStoreEvents, listeners);
	},

	initPageStores: function(cmpContext) {
		var context = this.UserDataStore.getContext(cmpContext),
			currentPageStoresMap = {};

		if (!context.pageStoreEvents && !context.currentPageStores) {
				context.pageStoreEvents = new Ext.util.Observable();
				ObjectUtils.defineAttributes(context, {
					currentPageStores: {
						getter: function() { return currentPageStoresMap; },
						setter: function(s) {
							var key, o, m = currentPageStoresMap || {};

							currentPageStoresMap = s;

							for (key in m) {
								if (m.hasOwnProperty(key)) {
									o = m[key];
									delete m[key];

									if (o) {
										console.debug('Setting currentPageStores:', o.storeId, 'Does not clear:', o.doesNotClear);

										if (!o.doesNotClear) {
											o.fireEvent('clearnup', o);
											o.clearListeners();
											o.clearFilter(true);
											o.removeAll();
										} else {
											s[key] = o;
										}
									}
								}
							}
						}
					}
				});
		}
	},

	clearPageStore: function(ctx) {
		ctx = ctx || this.UserDataStore.getContext();

		var fp = ctx.flatPageStore;

		ctx.currentPageStores = {};
		fp.removeFilter('lineFilter');
		fp.removeAll();

		if (fp.getRange().length !== 0) {
			console.error('Flat Page store not empty!');
		}
	},

	getPageStore: function(id, ctx) {
		ctx = ctx || this.UserDataStore.getContext();

		var theStore, root;

		if (!id) {
			Ext.Error.raise('ID required');
		}

		function bad() { console.error('There is no store for id:' + id); }

		theStore = ctx.currentPageStores[id];

		if (!theStore) {
			root = ctx.currentPageStores.root;

			if (root && (id === root.containerId)) {
				theStore = root;
			}
		}

		return theStore || {bad: true, add: bad, getById: bad, remove: bad, on: bad, each: bad, un: bad, getItems: bad, getCount: bad};
	},

	hasPageStore: function(id, ctx) {
		ctx = ctx || this.UserDataStore.getContext();

		return !id ? false : (ctx.currentPageStores || {}).hasOwnProperty(id);
	},

	addPageStore: function(id, store, ctx) {
		ctx = ctx || this.UserDataStore.getContext();

		var events = ctx.pageStoreEvents,
			monitors = events.managedListeners || [];

		if (this.hasPageStore(id, ctx) && this.getPageStore(id, ctx) !== store) {
			console.warn('replacing an existing store??');
		}

		store.cacheMapId = store.cacheMapId || id;

		ctx.currentPageStores[id] = store;

		if (!store.doesNotParticipateWithFlattenedPage) {
			ctx.flatPageStore.bind(store);
		}

		store.on({
			scope: this,
			load: StoreUtils.fillInUsers,
			add: StoreUtils.fillInUsers
		});

		/**
		* For specialty stores that do not want to trigger events all over the application, they will set this flag.
		* See the PageItem store's property documentation
		* {@see NextThought.store.PageItem}
		*
		* An example of when you would want to set this is if there are two stores that represent the same set of data
		* and they are currently active ...such as the "notes only" store in the slide deck, and the general purpose
		* store on the page...	adding to the slide's store would trigger a duplicate event (the page's store would be
		* added to as well)
		*/
		if (store.doesNotShareEventsImplicitly) {
			return;
		}

		//Because root is just an alias of the NTIID store that represents the page root, it was causing two monitors
		// to be put on the store...so we will skip stores we are already monitoring
		if (Ext.Array.contains(Ext.Array.pluck(monitors, 'item'), store)) {
			//This prevents two invocations of event handlers for one event.
			return;
		}

		store.on('cleanup', 'destroy',
				events.relayEvents(store, ['add', 'bulkremove', 'remove']));
	},

	onAnnotationsLineFilter: function(cmp, line) {
		var context = this.UserDataStore.getContext(cmp),
			store = context.flatPageStore;

		store.removeFilter('lineFilter');

		if (line) {
			store.filteredLine = line;
			store.addFilter({
				id: 'lineFilter',
				filterFn: function(r) {
					return r.get('line') === line;
				}
			});
		}

		store.sort();
	},

	onAnnotationsFilter: function(cmp) {
		var context = this.UserDataStore.getContext(cmp),
			listParams = FilterManager.getServerListParams(),
			filter = ['TopLevel'];

		if (listParams.filter) {
			filter.push(listParams.filter);
		}

		function loaded(store, records, success) {
			var bins = store.getBins();

			if (!success) {
				return;
			}

			cmp.getAnnotations().objectsLoaded(store.getItems(bins), bins, store.containerId);
		}

		function containerStorePredicate(k, s) {
			return s.hasOwnProperty('containerId') && !!context.currentPageStores[s.containerId];
		}

		this.UserDataStore.applyToStores(function(k, s) {
			var params = s.proxy.extraParams || {};

			params = Ext.apply(params, {
				sortOn: 'lastModified',
				sortOrder: 'descending'
			});

			s.on('load', loaded, this, {single: true});

			//Clear out any old filter information. It has changed after all
			delete params.filter;
			delete params.accept;
			delete params.sharedWith;

			if (Ext.isEmpty(filter)) {
				params.filter = filter.join(',').replace(/,+$/, '');
			}

			if (listParams.accept) {
				params.accept = listParams.accept;
			}

			if (!Ext.isEmpty(listParams.sharedWith)) {
				params.sharedWith = listParams.sharedWith.join(',');
			}

			s.proxy.extraParams = params;

			s.removeAll();
			s.loadPage(1);
		}, containerStorePredicate);
	},

	loadAnnotations: function(cmp, containerId, pageInfo, containers) {
		var me = this,
			Store = NextThought.store.PageItem,
			userDataStore = me.UserDataStore,
			context = userDataStore.getContext(cmp),
			rel = Globals.USER_GENERATED_DATA, //TODO: should this be recursive generated data
			pageStore = pageInfo && Store.make(pageInfo.getLink(rel), containerId, true);

		if (!pageInfo) {
			return;
		}

		userDataStore.setContext(context);

		try {
			me.clearPageStore(context);

			me.addPageStore('root', pageStore, context);

			if (!Ext.Array.contains(containers, containerId)) {
				containers.push(containerId);
			}

			Ext.each(containers, function(id) {
				me.addPageStore(id, (containerId === id) ?//ensure we don't duplicate the root store
									pageStore : Store.make(pageInfo.getSubContainerURL(rel, id), id));
			});

			this.onAnnotationsFilter(cmp);
		} finally {
			userDataStore.clearContext();
		}
	},

	applyToStores: function() {
		this.UserDataStore.applyToStores.apply(this.UserDataStore, arguments);
	},

	applyToStoresThatWantItem: function() {
		this.UserDataStore.applyToStoresThatWantItem.apply(this.UserDataStore, arguments);
	},

	setupPageStoreDelegates: function(cmp) {
		var context = this.UserDataStore.getContext(cmp),
			delegate, delegates = {};

		function bind(fn, me) {
			return function() {
				try {
					me.UserDataStore.setContext(context);
					return fn.apply(me, arguments);
				} finally {
					me.UserDataStore.clearContext();
				}
			}
		}

		delegates.clearPageStore = bind(this.clearPageStore, this);
		delegates.addPageStore = bind(this.addPageStore, this);
		delegates.getPageStore = bind(this.getPageStore, this);
		delegates.hasPageStore = bind(this.hasPageStore, this);
		delegates.applyToStores = bind(this.applyToStores, this);
		delegates.applyToStoresThatWantItem = bind(this.applyToStoresThatWantItem, this);

		for (delegate in delegates) {
			if (delegates.hasOwnProperty(delegate)) {
				if (cmp[delegate]) {
					console.warn('[W] !!!Overwritting existing property: ' + delegate + ' on ' + cmp.id, cmp);
				}
				cmp[delegate] = delegates[delegate];
			}
		}
	},

	saveNewBookmark: function(container) {
		var me = this,
			bm = NextThought.model.Bookmark.create({
				ContainerId: container,
				applicableRange: NextThought.model.anchorables.ContentRangeDescription.create()
			});

		return new Promise(function(fulfill, reject) {
			bm.save({
				callback: function(record, operation) {
					try {
						if (operation.success) {
							fulfill(record);
						}
					} catch (err) {
						console.error('Something went terribly wrong...', err.stack || err.message);
					}
				}
			});
		});
	},

	getSaveCallback: function(fulfill, reject) {
		var me = this;

		return function(record, operation) {
			var success = operation.success, rec;

			try {
				rec = success ? ParseUtils.parseItems(operation.response.responseText)[0] : null;

				if (success) {
					me.incomingCreatedChange({}, rec, {});
					fulfill(rec);
				}
			} catch (err) {
				console.error('Something went terrible wrong...', err.stack || err.message);
				reject(err);
			}
		}
	},

	handleException: function(reject, proxy, response) {
		var error,
			msg = 'An unknown error occurred saving your note.';

		try {
			//TODO we can get other information from different parts of the response.
			//if it isn't json look elsewhere
			error = JSON.parse(response.responseText) || {};
		} catch (e) {
			error = {};
		}

		if (error.code === 'TooLong') {
			msg = 'Could not save your note. The tilte is too long. It should be 140 characters or less.';
		}

		alert({title: 'Error', msg: msg, icon: 'warning-red'});
		console.warn('Exception Message:', response.responseText);
	},

	__saveNote: function(applicableRange, body, title, ContainerId, shareWith, selectedText, style, callback) {
		var me = this,
			noteRecord = NextThought.model.Note.create({
				applicableRange: applicableRange,
				body: body,
				title: title,
				selectedText: selectedText,
				sharedWith: shareWith,
				style: style,
				ContainerId: ContainerId
			}),
			context = this.ContextStore.getContext(),
			url, i, c;


		for (i = context.length - 1; i >= 0; i--) {
			c = context[i];

			if (c && c.obj && c.obj.getLink && c.obj.getLink('Pages')) {
				url = c.obj.getLink('Pages');
				break;
			}
		}

		return new Promise(function(fulfill, reject) {
			noteRecord.getProxy().on('exception', function(proxy, response) {
				reject({proxy: proxy, repsonse: response});
			}, null, {single: true});

			if (url) {
				noteRecord.save({url: url, callback: me.getSaveCallback(fulfill, reject)});
			} else {
				noteRecord.save({callback: me.getSaveCallback(fulfill, reject)});
			}
		});
	},

	saveNewNote: function(title, body, range, container, shareWith, style, callback) {
		if (!body || (Array.isArray(body) && body.length < 1)) {
			console.error('Note creating a noe missing content');
			return;
		}

		if (!range) {
			console.log('No range supplied, note will be anchored to container only');
		}

		var doc = range ? range.commonAncestorContainer.ownerDocument : null,
			rangeDescription = Anchors.createRangeDescriptionFromRange(range, doc),
			selectedText;

		if (!container) {
			console.error('No container supplied pulling container from rangeDescription', rangeDescription);
			container = rangeDescription.container;
		}

		//make sure the body is an array:
		if (!Array.isArray(body)) {
			body = [body];
		}

		//If a user is not allowed to share, remove any shared with fields
		if (!Service.canShare()) {
			shareWith = [];
		}

		selectedText = range ? range.toString() : '';
		return this.__saveNote(rangeDescription.description, body, title, container, shareWith, selectedText, style, callback);
	},

	saveNewSeriesNote: function(title, body, range, cueInfo, containerId, shareWith, style, callback) {
		console.log(cueInfo);
		var doc = range ? range.commonAncestorContainer.ownerDocument : null,
				AnchorResolver = NextThought.app.mediaviewer.components.reader.AnchorResolver,
				rangeDescription = AnchorResolver.createRangeDescriptionFromRange(range, doc, cueInfo),
				selectedText = range ? range.toString() : '';

		return this.__saveNote(rangeDescription.description, body, title, containerId, shareWith, selectedText, style, callback);
	},

	saveNewReply: function(recordRepliedTo, replyBody, shareWith, callback) {
		//some validation of input:
		if (!recordRepliedTo) {
			return Promise.reject('Must reply a record to reply to');
		}

		if (!Array.isArray(replyBody)) {
			replyBody = [replyBody];
		}

		var me = this,
			replyRecord = recordRepliedTo.makeReply(),
			root = AnnotationUtils.getNoteRoot(recordRepliedTo);

		replyRecord.set('body', replyBody);
		console.log('Saving reply', replyRecord, ' to ', recordRepliedTo);

		return new Promise(function(fulfill, reject) {
			replyRecord.save({scope: me, callback: me.getSaveCallback(fulfill, reject)});
		}).then(function(record) {
			recordRepliedTo.fireEvent('child-added', record);

			return record;
		});
	},

	savePhantomAnnotation: function(record, applySharing, successFn, failureFn) {
		var p,
			me = this;

		if (applySharing) {
			p = this.getPreferences(record.get('ContainerId'))
				.then(function(sharing) {
					return ((sharing || {}).sharing || {}).sharedWith || null;
				}, function() {
					return null;
				});
		} else {
			p = Promise.resolve(null);
		}

		return p.then(function(share) {
			record.set('SharedWith', share);

			return new Promise(function(fulfill, reject) {
				record.save({scope: me, callback: me.getSaveCallback(fulfill, reject)});
			});
		});
	},

	/**
	 * Save the sharing prefs as the default for the container in this context
	 * where context is a bundle.
	 *
	 * @param  {String} container NTIID for the container
	 * @param  {Object} shareWith entities and public toggle
	 * @param  {Bundle} context	  the bundle to make this the default sharing prefs for
	 * @return {Promsie}
	 */
	saveSharingPrefs: function(container, prefs, context) {
		var me = this;

		if (!context) {
			console.error('No context passed to save sharing prefs to');
			return;
		}

		return ContentUtils.getLineage(container, context)
			.then(function(lineages) {
				var lineage = lineages[0],
					root = lineage.last() || container;

				return root;
			})
			.then(Service.getPageInfo.bind(Service))
			.then(function(pageInfo) {
				if (!pageInfo) {
					return Promise.reject('No page info');
				}

				return new Promise(function(fulfill, reject) {
					pageInfo.saveField('sharingPreference', {sharedWith: prefs}, function(field, value, pi, newPageInfo) {
						//always happen if success only:
						me.updatePreferences(newPageInfo);
						fulfill([]);
					});
				});
			})
			.fail(function(reason) {
				console.error('failed to save default sharing, ', reason);
			});

	},

	updateShareWith: function(record, sharedWith, saveAsDefault, context) {
		if (!record) {
			return Promise.resolve();
		}

		//Clean the body
		//TODO: FIXME seems strange we should have to clean the body here...
		var body = record.get('body'),
			newSharedWith = SharingUtils.sharedWithForSharingInfo(sharedWith);

		if (Ext.isArray(body)) {
			body = Ext.Array.clean(body);
		}

		record.set('body', body);

		if (saveAsDefault) {
			//update the default sharing setting if we have a shared with:
			this.saveSharingPrefs(record.get('ContainerId'), newSharedWith, context);
		}

		if (Globals.arrayEquals(record.get('sharedWith') || [], newSharedWith || [])) {
			console.log('Sharing not mutated. Not showing changes', record.get('sharedWith'), newSharedWith);
			return Promise.resolve();
		}

		return new Promise(function(fulfill, reject) {
			SharingUtils.setSharedWith(record, newSharedWith, function(newRec, op) {
				if (op.success) {
					record.fireEvent('updated', newRec);
					fulfill();
				} else {
					console.error('Failed to save object');
					alert('Opps!\nCould not save');
					reject();
				}
			});
		});
	},

	define: function(term, boundingScreenBox, reader) {

		if (this.definition) {
			this.definition.close();
			delete this.definition;
		}
		this.definition = Ext.widget('dictionary-window', {
					term: term,
					pointTo: boundingScreenBox,
					reader: reader
				}).show();
	}
});
