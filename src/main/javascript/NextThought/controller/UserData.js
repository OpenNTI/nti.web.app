Ext.define('NextThought.controller.UserData', {
	extend: 'Ext.app.Controller',


	//<editor-fold desc="Config">
	requires: [
		'NextThought.app.domain.Annotation',
		'NextThought.app.domain.Model',
		'NextThought.cache.IdCache',
		'NextThought.util.Sharing',
		'NextThought.util.Store',
		'NextThought.util.Annotations',
		'NextThought.proxy.Socket',
		'NextThought.view.slidedeck.transcript.AnchorResolver'
	],


	models: [
		'anchorables.ContentPointer',
		'anchorables.DomContentPointer',
		'GenericObject',
		'PageInfo',
		'Highlight',
		'Note',
		'QuizQuestion',
		'QuizQuestionResponse',
		'QuizResult',
		'TranscriptSummary',
		'Transcript',
		'Bookmark'
	],


	stores: [
		'PageItem',
		'FlatPage'
	],


	views: [
		'Views',
		'annotations.Highlight',
		'annotations.Note',
		'annotations.note.Panel',
		'annotations.note.Viewer',
		'chat.transcript.Window',
		'content.Reader',
		'content.SimplePopoverWidget',
		'definition.Window',
		'sharing.Window',
		'library.View',
		'whiteboard.Window',
		'UserDataPanel'
	],


	refs: [
		{ ref: 'activeNoteViewer', selector: 'note-window'}
	],
	//</editor-fold>


	//<editor-fold desc="Init">
	init: function() {
		var me = this;

		this.application.on('session-ready', this.onSessionReady, this);

		this.listen({
			model: {
				'*': {
					'update-pageinfo-preferences': 'updatePreferences',
					'deleted': 'onRecordDestroyed'
				}
			},
			component: {
				'*': {
					'uses-page-preferences': 'setupPagePreferences',
					'uses-page-stores': 'setupPageStoreDelegates',
					'add-flatpage-store-context': 'initPageStores',
					'listens-to-page-stores': 'listenToPageStores',
					'open-chat-transcript': 'openChatTranscript',
					'load-transcript': 'onLoadTranscript',
					'save-new-note': 'saveNewNote',
					'save-new-series-note': 'saveNewSeriesNote',
					'register-note-window': 'registerNoteWindow'
				},
				'slidedeck-view': {
					exited: 'presentationExited'
				},
				'media-viewer': {
					exited: 'presentationExited'
				},

				'reader-content': {
					'annotations-load': 'onAnnotationsLoad',
					'filter-annotations': 'onAnnotationsFilter',
					'filter-by-line': 'onAnnotationsLineFilter',
					'removed-from-line': { fn: 'maybeRemoveLineFilter', buffer: 1 },

					'share-with': 'shareWith',
					'define': 'define',
					'redact': 'redact',
					'save-phantom': 'savePhantomAnnotation',
					'display-popover': 'onDisplayPopover',
					'dismiss-popover': 'onDismissPopover'
				},


				'reader annotation-view': {
					'refresh': 'onAnnotationViewRefreshed',
					'viewready': 'onAnnotationViewReady',
					'scrolled-to-end': { fn: 'onAnnotationViewMayNeedPaging', buffer: 500 }
				},


				'activity-preview': {
					'share': 'shareWith',
					'chat': 'replyAsChat'
				},

				'activity-preview-note > nti-editor': {
					'save': 'savePreviewNoteReply'
				},

				'activity-preview-note > activity-preview-note-reply > nti-editor': {
					'save': 'savePreviewNoteReply'
				},

				'activity-preview-note-reply': {
					'delete-reply': 'deleteNoteReply'
				},

				'note-panel': {
					'save-new-reply': 'saveNewReply',
					'share': 'shareWith',
					'chat': 'replyAsChat'
				},


				'share-window[record] button[action=save]': {
					'click': 'onShareWithSaveClick'
				},

				'content-page-widgets': {
					'save-new-bookmark': 'saveNewBookmark'
				},

				'annotation-view': {
					'select': 'showNoteViewer'
				}
			}
		});

		Socket.register({
			'data_noticeIncomingChange': function(c) {me.onIncomingChange(c);}
		});

		Ext.apply(this.changeActionMap, {
			created: this.incomingCreatedChange,
			deleted: this.incomingDeletedChange,
			modified: this.incomingModifiedChange,
			shared: this.incomingSharedChange
			// circled: //do nothing? Thats what we have been doing :P
		});
		this.flatPageContextMap = {};
	},


	onSessionReady: function() {
		var app = this.application,
			token = {};

		function finish() { app.finishInitializeTask(token); }

		function fail() {
			console.log('Failed to resolve root page info');
			finish();
		}

		function pass(pageInfo) {
			//console.log('loaded in UserData Controller');
			NextThought.store.PageItem.prototype.proxy.url =
				pageInfo.getLink(Globals.RECURSIVE_STREAM).replace(
					Globals.RECURSIVE_STREAM,
					Globals.RECURSIVE_USER_GENERATED_DATA);
			finish();
		}


		app.registerInitializeTask(token);
		Service.getPageInfo(Globals.CONTENT_ROOT, pass, fail, this);
	},
	//</editor-fold>


	//<editor-fold desc="UI Manipulation">
	showNoteViewer: function(sel, rec) {
		var me = this,
			anchorCmp = sel.view.anchorComponent,
			block = sel.mon(sel, {
				destroyable: true,
				beforeselect: function() {this.deselectingToSelect = true;},
				beforedeselect: function(s, r) {
					var w = me.activeNoteWindow,
							allow = this.deselectingToSelect && (!w || w.close());

					if (allow) {
						delete this.deselectingToSelect;
					}

					return allow || (r !== rec);
				}
			});

		function deselect() {
			block.destroy();
			sel.deselect(rec);
		}

		try {
			me.activeNoteWindow = Ext.widget({
				xtype: 'note-window',
				record: rec,
				reader: anchorCmp,
				floatParent: sel.view,
				listeners: {beforedestroy: deselect},
				xhooks: anchorCmp.getViewerHooks && anchorCmp.getViewerHooks()
			});
			me.activeNoteWindow.show();
		}
		catch (e) {
			if (e.sourceMethod !== 'closeOrDie') {
				console.error(e.toString(), e);
			}
			deselect();
		}
	},

	registerNoteWindow: function(sender, win) {
		this.activeNoteWindow = win;
	},


	presentationExited: function() {
		if (this.activeNoteWindow) {
			this.activeNoteWindow.destroy();
		}
	},
	//</editor-fold>


	//<editor-fold desc="Socket">
	changeActionMap: {
		/**
		 * Stubs that show what we could handle. They will be called with these args:
		 *
		 *    @param {Object/Ext.data.Model} change the change record.
		 *    @param {Object/Ext.data.Model} item Item the change is about.
		 *    @param {Object} meta Location meta data
		 *
		 * these are assigned in the init() above
		 */
		created: Ext.emptyFn,
		deleted: Ext.emptyFn,
		modified: Ext.emptyFn,
		shared: Ext.emptyFn,
		circled: Ext.emptyFn
	},


	onIncomingChange: function withMeta(change, meta, reCalled) {
		//fancy callback that calls this function back with addtional arguments
		function reCall(meta) {
			var c = ParseUtils.parseItems([change.raw])[0];
			withMeta.call(me, c, meta, true);
		}

		//we require at least a change object
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

		//only call this on first call
		if (!reCalled) {
			//update the stream
			this.callOnAllControllersWith('incomingChange', change);
		}

		//callback with ourself, only if we haven't already and there is a containerId to resolve
		if (!meta && !reCalled && cid) {
			LocationMeta.getMeta(cid, reCall, me);
			return;
		}

		//if there was a container id, but it didn't resolve, we're in trouble.
		if (!meta && cid) {
			console.warn('No meta data for Container: ' + cid);
			//return;
		}

		try {
			//Now that all the data is in order, lets dole out the responsibility to chageType specific functions and,
			// btw... Ext.callback handles unmapped actions for us. (if the callback is not a function, then it just
			// returns)
			fn = me.changeActionMap[type];
			//But for sake of logging, lets test it.
			if (!fn) {
				console.warn('"' + type + '" Change is not being handled:', change);
			}
			Ext.callback(fn, me, [change, item, meta]);
		}
		catch (e2) {
			console.error(Globals.getError(e2));
		}
	},


	incomingCreatedChange: function(change, item, meta) {
		var cid = item.get('ContainerId'),
			actedOn = false,
			recordForStore = item;

		this.applyToStoresThatWantItem(function(id, store) {
			if (store) {
				actedOn = true;
				console.log(store, cid);

				if (store.findRecord('NTIID', item.get('NTIID'), 0, false, true, true)) {
					console.warn('Store already has item with id: ' + item.get('NTIID'), item);
				}

				if (!recordForStore) {
					//Each store gets its own copy of the record. A null value indicates we already added one to a
					// store, so we need a new instance.  Read it out of the orginal raw value.
					recordForStore = ParseUtils.parseItems([item.raw])[0];
				}

				//The store will handle making all the threading/placement, etc
				store.add(recordForStore);
				//once added, null out this pointer so that subsequant loop iterations don't readd the same instance to
				// another store. (I don't think our threading algorithm would appreciate that)
				recordForStore = null;
			}
		}, item);

		if (!actedOn) {
			console.warn('We did not act on this created change event:', change, ' location meta:', meta);
		}
	},


	incomingDeletedChange: function(change, item, meta) {
		var cid = item.get('ContainerId'),
			actedOn = false;

		this.applyToStoresThatWantItem(function(id, store) {
			var r;
			if (store) {
				actedOn = true;
				console.log(store, cid);
				r = store.findRecord('NTIID', item.get('NTIID'), 0, false, true, true);
				if (!r) {
					console.warn('Could not remove, the store did not have item with id: ' + item.get('NTIID'), item);
					return;
				}

				//The store will handle making it a placeholder if it needs and fire events,etc... this is all we need to do.
				store.remove(r);
			}
		}, item);

		if (!actedOn) {
			console.warn('We did not act on this created change event:', change, ' location meta:', meta);
		}
	},


	incomingModifiedChange: function(change, item, meta) {
		var cid = item.get('ContainerId'),
			actedOn = false;

		this.applyToStoresThatWantItem(function(id, store) {
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
			console.warn('We did not act on this created change event:', change, ' location meta:', meta);
		}
	},


	incomingSharedChange: function(change, item, meta) {
		console.warn('what would we do here? treading as a create.');
		this.incomingCreatedChange.apply(this, arguments);
	},
	//</editor-fold>


	onRecordDestroyed: function(record) {
		if (!Ext.isEmpty(record.stores)) {
			return;
		}

		this.applyToStoresThatWantItem(function(key, store) {
			store.removeByIdsFromEvent(record.getId(), true);
		}, record);
	},


	listenToPageStores: function(monitor, listeners) {
		var ctx = this.getContext(monitor) || this.flatPageContextMap['main-reader-view'];//this or branch is for the current PresentationView
		monitor.mon(ctx.pageStoreEvents, listeners);
	},


	setupPageStoreDelegates: function(cmp) {
		function bind(fn, me) {
			return function() {
				try {
					me.setContext(context);
					return fn.apply(me, arguments);
				}
				finally {
					me.clearContext();
				}
			};
		}

		var context = this.getContext(cmp),
			delegate,
			delegates = {
				clearPageStore: bind(this.clearPageStore, this),
				addPageStore: bind(this.addPageStore, this),
				getPageStore: bind(this.getPageStore, this),
				hasPageStore: bind(this.hasPageStore, this),
				applyToStores: bind(this.applyToStores, this),
				applyToStoresThatWantItem: bind(this.applyToStoresThatWantItem, this)
			};

		for (delegate in delegates) {
			if (delegates.hasOwnProperty(delegate)) {
				if (cmp[delegate]) {
					console.warn('[W] !!!Overwritting existing property: ' + delegate + ' on ' + cmp.id, cmp);
				}
				cmp[delegate] = delegates[delegate];
			}
		}
	},


	//<editor-fold desc="Context Functions">
	getContext: function(cmp) {
		if (cmp) {
			if (!cmp.flatPageStore) {
				cmp = cmp.up('[flatPageStore]');
				if (!cmp) {
					Ext.Error.raise('No context');
				}
			}

			var c = this.flatPageContextMap;
			if (!c.hasOwnProperty(cmp.id)) {
				cmp.on('destroy', function() {
					delete c[cmp.id];
				});
			}
			c[cmp.id] = (c[cmp.id] || {flatPageStore: cmp.flatPageStore});

			return c[cmp.id];
		}

		return this.currentContext;
	},


	setContext: function(ctx) {
		this.currentContext = ctx;
	},


	clearContext: function() {
		delete this.currentContext;
	},


	initPageStores: function(cmpContext) {
		//init the page store.
		var context = this.getContext(cmpContext),
			currentPageStoresMap = {};
		context.pageStoreEvents = new Ext.util.Observable();
		ObjectUtils.defineAttributes(context, {
			currentPageStores: {
				getter: function() {return currentPageStoresMap;},
				setter: function(s) {
					var key, o, m = currentPageStoresMap || {};
					currentPageStoresMap = s;
					for (key in m) {
						if (m.hasOwnProperty(key)) {
							o = m[key];
							delete m[key];
							if (o) {
								console.debug('Seting currentPageStores:', o.storeId, 'Does not clear:', o.doesNotClear);
								if (!o.doesNotClear) {
									o.fireEvent('cleanup', o);
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
	},
	//</editor-fold>


	clearPageStore: function() {
		var ctx = this.getContext(),
			fp = ctx.flatPageStore;
		ctx.currentPageStores = {};//see above defineAttributes call
		fp.removeFilter('lineFilter');
		fp.removeAll();
		if (fp.getRange().length !== 0) {
			console.error('Flat Page store not empty!!');
		}
	},


	hasPageStore: function(id) {
		var ctx = this.getContext();
		return !id ? false : (ctx.currentPageStores || {}).hasOwnProperty(id);
	},


	addPageStore: function(id, store) {
		var ctx = this.getContext(),
			events = ctx.pageStoreEvents, monitors = events.managedListeners || [];
		if (this.hasPageStore(id) && this.getPageStore(id) !== store) {
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
		 * store on the page...  adding to the slide's store would trigger a duplicate event (the page's store would be
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


	getPageStore: function(id) {
		var theStore, root, ctx = this.getContext();
		if (!id) {
			Ext.Error.raise('ID required');
		}

		function bad() { console.error('There is no store for id: ' + id); }

		theStore = ctx.currentPageStores[id];
		if (!theStore) {
			root = ctx.currentPageStores.root;
			if (root && (id === root.containerId)) {
				theStore = root;
			}
		}
		return theStore || { bad: true, add: bad, getById: bad, remove: bad, on: bad, each: bad, un: bad, getItems: bad, getCount: bad };
	},


	getStoreForLine: function(view, line) {
		var ctx = this.getContext(view),
			stores = ctx.currentPageStores,
			root = stores.root || {},
			key, s, potentials = [];


		function testStore(s) {
			var lines = testStore.lines = testStore.lines || {},
					l;

			if (s.each) {
				s.each(testStore);
				delete testStore.lines;
				return lines;
			}

			l = s.get('line');
			lines[l] = lines[l] + 1 || 1;
			return l;
		}


		for (key in stores) {
			if (stores.hasOwnProperty(key)) {
				if (key !== root.containerId && testStore(stores[key])[line]) {
					potentials.push(stores[key]);
				}
			}
		}

		if (potentials.length > 1) {
			Ext.log.warn('We found more than one store!');
		}

		return potentials[0];
	},


	//<editor-fold desc="Store Iteration">
	//Calls the provided fn on all the stores.  Optionally takes a predicate
	//which skips stores that do not match the predicate
	applyToStores: function(fn, predicate) {
		Ext.Object.each(this.flatPageContextMap, function(k, o) {
			Ext.Object.each(o.currentPageStores, function(k) {
				if (k === 'root') {
					return;
				}//root is an alisas of the ntiid
				if (!Ext.isFunction(predicate) || predicate.apply(null, arguments)) {
					Ext.callback(fn, null, arguments);
				}
			});
		});
	},


	applyToStoresThatWantItem: function(fn, item) {
		function predicate(id, store) {
			return store && store.wantsItem(item);
		}

		this.applyToStores(fn, predicate);
	},
	//</editor-fold>



	onAnnotationViewReady: function(view) {
		var bufferZone = 2; //two rows

		view.mon(view.el, {
			scope: view,
			scroll: function onScroll(e, dom) {
				var lastItem = dom.lastChild,
						direction = (onScroll.lastScrollTop || 0) - dom.scrollTop,
						buffer = dom.scrollHeight - (Ext.fly(lastItem).getHeight() * bufferZone) - Ext.fly(dom).getHeight(),
						top = buffer - dom.scrollTop;

				onScroll.lastScrollTop = dom.scrollTop;

				if (top <= 20 && direction < 0) {
					view.fireEvent('scrolled-to-end', view);
				}
			}
		});
	},


	onAnnotationViewRefreshed: function(view) {
		var ctx = this.getContext(view);
		//scrollHeight is === to height until its overflown. "<=" just feels safer :P
		if (ctx.flatPageStore.filteredLine && view.getEl().dom.scrollHeight <= view.getHeight()) {
			this.onAnnotationViewMayNeedPaging(view);
		}
	},


	onAnnotationViewMayNeedPaging: function(view) {
		var me = this,
			ctx = this.getContext(view),
			s = view.getStore();

		function maybeFirePagedIn(store, records) {
			if (records.length) {
				ctx.pageStoreEvents.fireEvent('paged-in', store, records);
			}
		}

		if (s !== ctx.flatPageStore) {
			Ext.log.warn('skipping paging logic...not what we expected');
			return;
		}

		if (!s.filteredLine) {
			Ext.log.info('Not filtering on a line. Pass.');
			return;
		}

		s = this.getStoreForLine(view, s.filteredLine);
		if (s && s.getCount() < s.getTotalCount()) {
			s.on('load', maybeFirePagedIn, s, {single: true});
			s.nextPage();
		}
	},


	onAnnotationsLineFilter: function(cmp, line) {
		var ctx = this.getContext(cmp),
			s = ctx.flatPageStore;

		s.removeFilter('lineFilter');
		if (line) {
			s.filteredLine = line;
			s.addFilter({
				id: 'lineFilter',
				filterFn: function(r) {
					return r.get('line') === line;
				}
			});
		}

		s.sort();
	},


	maybeRemoveLineFilter: function(cmp) {
		var ctx = this.getContext(cmp),
			s = ctx.flatPageStore;
		if (s.getCount() === 0) {
			delete s.filteredLine;
			s.removeFilter('lineFilter');
		}
	},


	onAnnotationsFilter: function(cmp) {
		var ctx = this.getContext(cmp),
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
			return s.hasOwnProperty('containerId') && !!ctx.currentPageStores[s.containerId];
		}

		this.applyToStores(function(k, s) {
			var params = s.proxy.extraParams || {};

			params = Ext.apply(params, {
				sortOn: 'lastModified',
				sortOrder: 'descending'
			});

			s.on('load', loaded, this, { single: true });

			//Clear out any old filter information.	 It has changed after all
			delete params.filter;
			delete params.accept;
			delete params.sharedWith;

			if (!Ext.isEmpty(filter)) {
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


	onAnnotationsLoad: function(cmp, containerId, containers) {
		var Store = NextThought.store.PageItem,
			rel = Globals.USER_GENERATED_DATA,
			pi = cmp.getLocation().pageInfo,
			ps = pi && Store.make(pi.getLink(rel), containerId, true),
			me = this;

		if (!pi) {
			return;
		}

		containers = containers || [];

		this.setContext(this.getContext(cmp));
		try {
			this.clearPageStore();

			this.addPageStore('root', ps);//add alias of root store

			if (!Ext.Array.contains(containers, containerId)) {
				containers.push(containerId);
			}

			Ext.each(containers, function(id) {
				me.addPageStore(id, (containerId === id) ?//ensure we don't duplicate the root store
									ps : Store.make(pi.getSubContainerURL(rel, id), id));
			});

			this.onAnnotationsFilter(cmp);
		} finally {
			this.clearContext();
		}
	},


	//<editor-fold desc="Record Event Handlers (Save, Delete, etc)">
	saveSharingPrefs: function(pageInfoId, prefs, callback) {
		//TODO - check to see if it's actually different before save...
		var me = this,
			pi = ContentUtils.getLineage(pageInfoId).last() || pageInfoId;
		//get parent:
		Service.getPageInfo(pi,
				function(topPi) {
					if (topPi) {
						topPi.saveField('sharingPreference', {sharedWith: prefs}, function(fieldName, sanitizedValue, pi, refreshedPageInfo) {
							//always happens if success only:
							me.updatePreferences(refreshedPageInfo);
							Ext.callback(callback, null, []);
						});
					}
				},
				function() {
					console.error('failed to save default sharing');
				},
				this);


	},


	updatePreferences: function(pi) {

		if (!Library.loaded) {
			Library.on('loaded', Ext.bind(this.updatePreferences, this, arguments), this, {single: true});
			return;
		}

		if (Ext.isArray(pi)) {
			Ext.each(pi, this.updatePreferences, this);
			return;
		}

		var sharing = pi.get('sharingPreference'),
				piId = pi.getId(),
				rootId = ContentUtils.getLineage(piId).last();

		if (!this.preferenceMap) {
			this.preferenceMap = {};
		}

		if (sharing && /inherited/i.test(sharing.State) && rootId === sharing.Provenance) {
			//got a sharing value from the root id, add it to the map
			piId = rootId;
		}
		else if (!sharing || (!/set/i.test(sharing.State) && piId !== rootId)) {
			//console.debug('Not setting prefs', sharing, (sharing||{}).State);
			return;
		}
		this.preferenceMap[piId] = {sharing: sharing};
		console.debug('shareing prefs updated', this.preferenceMap[piId]);

		if (sharing && sharing.sharedWith) {
			// Let's pre-resolve the users that are part of the default sharing list.
			// By the time, we look it up, it should be in the userRepository cache, if it's resolvable.
			UserRepository.getUser(sharing.sharedWith, function(users) {
				var allResolved = Ext.Array.every(users, function(i) { return !i.Unresolved; }),
						names = [];

				if (allResolved) {
					Ext.each(users, function(u) { names.push(u.getName()); });
					console.log('default sharing should contain: ', names);
				}
			}, this);
		}
	},

	/**
	 * Takes an ntiid or an array of ntiids [lineage], it will go from the leaf to the root
	 * and return a promise that fulfills with the sharing prefs of the first ntiid that has them
	 * @param  {String} ntiid A single ntiid or the lineage of an ntiid
	 * @return {Promise}      Fulfills with the first sharing prefs in the lineage
	 */
	__getPreferenceFromLineage: function(ntiid) {
		if (!ntiid) { return Promise.reject('No id to get preference for.'); }

		var preferenceMap = this.preferenceMap,
			lineage = Ext.isArray(ntiid) ? ntiid : ContentUtils.getLineage(ntiid),
			preferenceOrPageInfo = lineage.map(function(id) {
				//if we have it cached return that, else call Service.getPageInfo which will get the
				//page info and cache the sharing prefs on this.preferenceMap
				return preferenceMap[id] || Service.getPageInfo.bind(Service, id);
			});

		return Promise.first(preferenceOrPageInfo)
			.then(function(p) {
				if (p.isPageInfo) {
					return preferenceMap[p.getId()] || {sharing: p.get('sharingPreference')};
				}

				return p;
			})
			.fail(function(reason) {
				console.error('Failed to get preference from lineage: ', reason);
				return null;
			});
	},


	setupPagePreferences: function(cmp) {
		cmp.getPagePreferences = Ext.bind(this.getPreferences, this);
	},

	/**
	 * Returns preferences for the given ntiid.  Currently this functions primary responsibility is
	 * to determine the intial sharedWith list that userdata (new notes) should have the sharedWith list
	 * defaulted to.
	 *
	 * Details on determing a ntiids default sharedWith.  This piggy backs off of the original sharingPreferneces
	 * that the server has long been sending back as part of the PageInfo, with some additional steps/complications
	 * to make the sharing default to something sane(?) for both open and for credit students when in the context
	 * of a course.
	 *
	 * The current business logic is as follows.  In the context of a book use whatever the content default is,
	 * or whatever the user has overriden it to.  For a course, students enrolled for credit should default to
	 * the for credit dfl unless they have changed the default.  In courses, open users default to whatever public means for that
	 * course unless they have changed the default..  I don't think this business logic will make sense at even
	 * the next step forward in formalizing CourseInstances so we should revist both the current business logic and implementation
	 * at that point in time.
	 *
	 * Meeting the business case for the books and content is currently done using the same implementation.
	 * This is possible because we piggy back on some of the implementation details of how the communities and dfls are setup
	 * for legacy community based courses.  Obviously this level of coupling to implementation details is extermely fragile.
	 * This is one place where moving things further into the server can help immensly.  That will come with time.
	 *
	 * We start with the sharingPreferences, which by default for course content packages are configured to be the for credit dfl.
	 * Given the list of default entites we then attempt to validate it.  The list of entities is valid iff we can resolve all
	 * usernames/ntiids in it to Entities (users, friendslists, dfls, or communities) AND entites that are friendslists, dfls, or communities
	 * are in our set of friendslists, dfls, communities we own or are a member of.  If the sharedWith list is found to be valid, we use it
	 * as is.  If the default sharing entites are found to be invalid or if we never found the default sharingPreferences to begin with,
	 * we default to whatever 'public' means for the 'title' this ntiid belong to.  Note: this last detail also has assumptions
	 * baked in around one content package per course, and the lack of cross content/course references.  When we have courses
	 * references books external to their content package this will break.
	 *
	 *
	 * @param {String} ntiid
	 * @return {Object} An object encasuplating the prefences for the given ntiid.  Sharing related preferences are found beneath
	 * the 'sharing' key
	 */
	getPreferences: function(ntiid) {
		if (!this.preferenceMap || !ntiid) {
			return Promise.reject('No preferences or no id.');
		}

		var lineage = ContentUtils.getLineage(ntiid),
			rootId = lineage.last();

		return this.__getPreferenceFromLineage(lineage)
			.then(function(result) {
				var sharingIsValid = result && !Ext.isEmpty(result.sharing),
					flStore = Ext.getStore('FriendsList');

				if (result && !Ext.isEmpty(result.sharing)) {

					(result.sharing.sharedWith || []).every(function(id) {
						var entity = UserRepository.resolveFromStore(id),
							found;

						if (!entity) {
							sharingIsValid = false;
						}
						else {
							//If its not a user its a fl, or dfl we have to have it in
							//the fl store.  If its a community it would need to be in  our
							//community list
							if (entity.isFriendsList) {
								if (!flStore.getById(entity.getId())) {
									sharingIsValid = false;
								}
							}
							else if (entity.isCommunity) {
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

					return CourseWareUtils.getCourseInstance(rootId)
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


	define: function(term, boundingScreenBox, reader) {

		if (this.definition) {
			this.definition.close();
			delete this.definition;
		}
		this.definition = Ext.widget(
				'definition-window', {
					term: term,
					pointTo: boundingScreenBox,
					reader: reader
				}).show();
	},


	onShareWithSaveClick: function(btn) {
		var win = btn.up('window'),
			shbx = win.down('user-sharing-list'),
			v = shbx.getValue(),
			rec = win.record, b, newSharedWith,
			cb = win.down('checkbox'),
			saveAsDefault = cb ? cb.checked : false,
			me = this;

		//extra check here for a close...
		if (btn.text === 'Close') {
			win.close();
			return;
		}

		if (!rec) {
			return;
		}

		win.el.mask('Sharing...');

		//Clean the body
		//FIXME seems strange we should have to clean the body here...
		b = rec.get('body');
		if (Ext.isArray(b)) {
			b = Ext.Array.clean(b);
		}
		rec.set('body', b);

		newSharedWith = SharingUtils.sharedWithForSharingInfo(v);

		if (cb) {
			cb.setValue(false);
		}
		if (saveAsDefault) {
			//update default sharing setting if we have a shareWith:
			me.saveSharingPrefs(rec.get('ContainerId'), SharingUtils.sharedWithForSharingInfo(v));
		}

		if (Globals.arrayEquals(rec.get('sharedWith') || [], newSharedWith || [])) {
			console.log('Sharing not mutated.  Not showing changes', rec.get('sharedWith'), newSharedWith);
			win.close();
			return;
		}
		SharingUtils.setSharedWith(rec, newSharedWith, function(newRec, op) {
			if (op.success) {
				rec.fireEvent('updated', newRec);
				win.close();
			}
			else {
				console.error('Failed to save object');
				alert('Opps!\nCould not save');
				win.el.unmask();
			}
		});
	},


	onDismissPopover: function() {
		var me = this;
		if (me.popoverWidget) {
			me.popoverWidget.startCloseTimer();
		}
	},


	onDisplayPopover: function(sender, id, html, node) {
		var offsets = sender.reader.getAnnotationOffsets(),
			position = Ext.fly(node).getXY(),
			midpoint = Ext.fly(node).getWidth() / 2,
			me = this;

		position[0] += offsets.left + midpoint;
		position[1] += offsets.top;

		//WTF: What are these fixed "magic" numbers?
		function adjustPosition(position) {
			var horizontalSpaceNeeded = me.popoverWidget.getWidth() / 2;

			//adjust position depending on whether it should be shown on top or bottom
			if ((position[1] - offsets.scrollTop) < me.popoverWidget.getHeight()) {
				//bottom
				position[1] += 30;//What is 30?
				me.popoverWidget.addCls('top');
			}
			else {
				//top
				position[1] -= me.popoverWidget.getHeight();
				position[1] -= 20;//What is 20?
				me.popoverWidget.addCls('bottom');
			}

			//adjust position for left and right.  If we can be centered above it
			//we allow that, otherwise we move the bubble left and right
			if (position[0] + horizontalSpaceNeeded > Ext.Element.getViewportWidth()) {
				//the bubble needs to shift left, marker on the right
				position[0] = position[0] - (horizontalSpaceNeeded * 2) + 20;
				me.popoverWidget.addCls('right');
			}
			else if (position[0] - horizontalSpaceNeeded < 0) {
				//bubble needs to shift right, arrow on left
				position[0] -= 66;
				me.popoverWidget.addCls('left');
			}
			else {
				//centered
				position[0] -= (me.popoverWidget.width / 2);
			}

			return position;
		}

		if (me.popoverWidget) {
			me.popoverWidget.destroy();
			delete this.popoverWidget;
		}

		Ext.fly(html).select('a[href]', true).set({target: '_blank'});

		me.popoverWidget = Ext.widget('simple-popover-widget', {reader: sender.reader, text: html.innerHTML});
		me.popoverWidget.showAt(adjustPosition(position));
	},


	onLoadTranscript: function(record, cmp) {
		var model = this.getModel('Transcript'),
			id = record.get('RoomInfo').getId();

		model.getProxy().url = record.getLink('transcript');

		model.load(id, {
			scope: this,
			failure: function() {
				cmp.failedToLoadTranscript();
			},
			success: function(record) {
				cmp.insertTranscript(record);
			}
		});
	},


	saveNewBookmark: function(reader) {
		//create a bookmark model
		var me = this,
			bm = me.getBookmarkModel().create({
				ContainerId: reader.getLocation().NTIID,
				applicableRange: NextThought.model.anchorables.ContentRangeDescription.create()
			});

		//now save this:
		bm.save({
			callback: function(record, operation) {
				try {
					if (operation.success) {
						me.fireEvent('bookmark-loaded', record);
					}
				}
				catch (err) {
					console.error('Something went teribly wrong... ', err.stack || err.message);
				}
			}
		});
	},


	getSaveCallback: function(callback) {
		var me = this;
		return function(record, operation) {
			var success = operation.success, rec;
			console.log('Note save callback', success, operation);
			try {
				rec = success ? ParseUtils.parseItems(operation.response.responseText)[0] : null;
				if (success) {
					me.incomingCreatedChange({}, rec, {});
					AnnotationUtils.addToHistory(rec);
				}
			}
			catch (err) {
				console.error('Something went teribly wrong... ', err.stack || err.message);
			}
			Ext.callback(callback, this, [success, rec]);
		};
	},


	saveNewNote: function(title, body, range, c, shareWith, style, callback) {
		//check that our inputs are valid:
		if (!body || (Ext.isArray(body) && body.length < 1)) {
			console.error('Note creating a note missing content');
			return;
		}

		if (!range) {
			console.log('No range supplied, note will be anchored to container only');
		}

		console.log('Saving new note with body', body);

		//Define our vars and create our content range description:
		var doc = range ? range.commonAncestorContainer.ownerDocument : null,
			rangeDescription = Anchors.createRangeDescriptionFromRange(range, doc),
			container = c, selectedText;

		if (!container) {
			console.error('No container supplied pulling container from rangeDescription', rangeDescription);
			container = rangeDescription.container;
		}

		//make sure the body is an array:
		if (!Ext.isArray(body)) {
			body = [body];
		}

		//If a user it not allowed to share, remove any shared with fields
		if (!Service.canShare()) {
			shareWith = [];
		}

		selectedText = range ? range.toString() : '';
		this.saveNote(rangeDescription.description, body, title, container, shareWith, selectedText, style, callback);
	},


	saveNote: function(applicableRange, body, title, ContainerId, shareWith, selectedText, style, callback) {
		//define our note object:
		var noteRecord = this.getNoteModel().create({
			applicableRange: applicableRange,
			body: body,
			title: title,
			selectedText: selectedText,
			sharedWith: shareWith,
			style: style,
			ContainerId: ContainerId
		});

		console.log('Saving new record', noteRecord);
		noteRecord.getProxy().on('exception', this.handleException, this, {single: true});
		//now save this:
		noteRecord.save({ scope: this, callback: this.getSaveCallback(callback)});
	},


	saveNewSeriesNote: function(title, body, range, cueInfo, containerId, shareWith, style, callback) {
		console.log(cueInfo);
		var doc = range ? range.commonAncestorContainer.ownerDocument : null,
				AnchorResolver = NextThought.view.slidedeck.transcript.AnchorResolver,
				rangeDescription = AnchorResolver.createRangeDescriptionFromRange(range, doc, cueInfo),
				selectedText = range ? range.toString() : '';

		this.saveNote(rangeDescription.description, body, title, containerId, shareWith, selectedText, style, callback);
	},


	handleException: function(proxy, response/*, operation*/) {
		var error,
			msg = 'An unknown error occurred saving your note.';

		try {
			//TODO We can get other information from different parts of the response.
			//if it isn't json look elsewhere
			error = JSON.parse(response.responseText) || {};
		}
		catch (e) {
			error = {};
		}

		if (error.code === 'TooLong') {
			msg = 'Could not save your note. The title is too long. It should be 140 characters or less.';
		}
		alert({title: 'Error', msg: msg, icon: 'warning-red'});
		console.warn('Exception Message: ', response.responseText);
	},


	savePreviewNoteReply: function(editor, record, valueObject, successCallback) {
		var cmp = editor.up('[record]'),
			isEdit = Boolean(record),
			replyToRecord = cmp && cmp.record;

		function callback(success, rec) {
			if (success) {
				Ext.callback(successCallback, null, [editor, cmp, rec]);
			}
			else {
				console.error('Could not save your reply: ', arguments);
			}
		}

		if (isEdit) {
			record.set({ body: valueObject.body });
			try {
				record.save({
					callback: function(record, request) {
						var success = request.success,
								rec = success ? request.records[0] : null;
						if (success) {
							Ext.callback(successCallback, null, [editor, cmp, rec]);
						}
					}
				});
			}
			catch (e) {
				console.error('FAIL: could not save the record properly! ', e);
			}
		} else {
			this.saveNewReply(replyToRecord, valueObject.body, valueObject.sharedWith, callback);
		}
	},


	saveNewReply: function(recordRepliedTo, replyBody, shareWith, callback) {
		//some validation of input:
		if (!recordRepliedTo) {
			Ext.Error.raise('Must supply a record to reply to');
		}
		if (!Ext.isArray(replyBody)) {
			replyBody = [replyBody];
		}

		//define our note object:
		var replyRecord = recordRepliedTo.makeReply(),
				root = AnnotationUtils.getNoteRoot(recordRepliedTo);

		replyRecord.set('body', replyBody);
		console.log('Saving reply', replyRecord, ' to ', recordRepliedTo);

		if (!root.store) {
			callback = Ext.Function.createInterceptor(callback, function(s, n) {
				if (s) {
					recordRepliedTo.fireEvent('child-added', n);
				}
			});
		}

		//now save this:
		replyRecord.save({ scope: this, callback: this.getSaveCallback(callback)});
	},


	deleteNoteReply: function(record, cmp, callback) {
		if (!record) {
			return;
		}

		record.destroy({
			success: function() {
				//TODO: do we need to look through all the store to see who cares about this record? or it's already handled.
				Ext.callback(callback, null, [cmp]);
			},
			failure: function() {
				alert('Sorry, could not delete that');
			}
		});
	},


	replyAsChat: function(record) {
		var top = record,
			people, cId, parent, refs;

		//go to the top, it has the info we need:
		while (top.parent) {
			top = top.parent;
		}


		people = Ext.Array.unique([record.get('Creator')].concat(top.get('sharedWith')).concat(top.get('Creator')));
		cId = record.get('ContainerId');
		parent = record.get('NTIID');
		refs = (record.get('references') || []).slice();

		this.getController('Chat').enterRoom(people, {ContainerId: cId, references: refs, inReplyTo: parent});
	},


	savePhantomAnnotation: function(record, applySharing, successFn, failureFn) {
		function callback(success, rec) {
			Ext.callback(success ? successFn : failureFn, null, [record, rec]);
		}

		var p = Promise.resolve(null);

		if (applySharing) {
			p = this.getPreferences(record.get('ContainerId'))
					.then(function(sharing) {
						return ((sharing || {}).sharing || {}).sharedWith || null;
					}, function() {
						return null;
					});
		}

		p.then(function(share) {
			record.set('SharedWidth', share);
			record.save({ scope: this, callback: this.getSaveCallback(callback) });
		}.bind(this));
	},


	shareWith: function(record) {
		var options = {};

		if (Ext.ComponentQuery.query('share-window[record]').length > 0) {
			//already a share with window, they are modal, just don't do this:
			return;
		}

		if (arguments[arguments.length - 1] === true) {
			options = {
				btnLabel: 'Discuss',
				titleLabel: 'Discuss This...'
			};
		}

		Ext.widget('share-window', Ext.apply({record: record}, options)).show();
	},


	redact: function(record) {
		if (!record) {
			return;
		}
		this.self.events.fireEvent('new-redaction', record);
	},


	openChatTranscript: function(records, clonedWidgetMarkup) {
		if (!Ext.isArray(records)) {
			records = [records];
		}
		var w = Ext.widget('chat-transcript-window', {waitFor: records.length, errorMsgSupplement: clonedWidgetMarkup});

		function loadTranscript(r) {
			if (r.isTranscript) {
				//its a transcript so load it straight to the window
				w.insertTranscript(r);
			} else {
				//its a summary so get the transcript first
				this.onLoadTranscript(r, w);
			}
		}

		Ext.each(records, loadTranscript, this);
	}
	//</editor-fold>
});
