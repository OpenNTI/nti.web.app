Ext.define('NextThought.controller.UserData', {
	extend: 'Ext.app.Controller',


	requires: [
		'NextThought.app.domain.Annotation',
		'NextThought.app.domain.Model',
		'NextThought.cache.IdCache',
		'NextThought.util.Sharing',
		'NextThought.proxy.Socket'
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


	refs: [],


	init: function() {
		var me = this;

		this.application.on('session-ready', this.onSessionReady, this);

		this.listen({
			model : {
				'*':{
					'update-pageinfo-preferences':'updatePreferences',
					'deleted': 'onRecordDestroyed'
				}
			},
			component:{
				'*': {
					'uses-page-preferences': 'setupPagePreferences',
					'uses-page-stores': 'setupPageStoreDelegates',
					'listens-to-page-stores': 'listenToPageStores',
					'open-chat-transcript': 'openChatTranscript',
					'load-transcript': 'onLoadTranscript',
					'save-new-note' : 'saveNewNote'
				},

				'reader-panel':{
					'annotations-load': 'onAnnotationsLoad',
					'filter-annotations': 'onAnnotationsFilter',
					'filter-by-line': 'onAnnotationsLineFilter',
					'removed-from-line': 'maybeRemoveLineFilter',

					'share-with'	: 'shareWith',
					'define'		: 'define',
					'redact'		: 'redact',
					'save-phantom'  : 'savePhantomAnnotation',
					'display-popover': 'onDisplayPopover',
					'dismiss-popover': 'onDismissPopover'
				},


				'activity-preview': {
					'share': 'shareWith',
					'chat': 'replyAsChat'
				},

				'activity-preview-note > nti-editor':{
					'save': 'savePreviewNoteReply'
				},

				'activity-preview-note > activity-preview-note-reply > nti-editor':{
					'save': 'savePreviewNoteReply'
				},

				'activity-preview-note-reply': {
					'delete-reply': 'deleteNoteReply'
				},

				'note-panel': {
					'save-new-reply' : 'saveNewReply',
					'share': 'shareWith',
					'chat': 'replyAsChat'
				},


				'share-window[record] button[action=save]':{
					'click': 'onShareWithSaveClick'
				},

				'content-page-widgets': {
					'save-new-bookmark': 'saveNewBookmark'
				},

				'annotation-view':{
					'select': 'showNoteViewer'
				}
			}
		});

		Socket.register({
			'data_noticeIncomingChange': function(c){me.incomingChange.apply(me, [c]);}
		});

		Ext.apply(this.changeActionMap,{
			created: this.incomingCreatedChange,
			deleted: this.incomingDeletedChange,
			modified: this.incomingModifiedChange,
			shared: this.incomingSharedChange
			// circled: //do nothing? Thats what we have been doing :P
		});

		this.initPageStores();
	},


	onSessionReady: function(){
		var app = this.application,
			token = {};

		function finish(){ app.finishInitializeTask(token); }
		function fail(){
			console.log('Failed to resolve root page info');
			finish();
		}
		function pass(pageInfo){
			console.log('loaded in UserData Controller');
			NextThought.store.PageItem.prototype.proxy.url
					= pageInfo.getLink(Globals.RECURSIVE_STREAM).replace(
						Globals.RECURSIVE_STREAM,
						Globals.RECURSIVE_USER_GENERATED_DATA);
			finish();
		}


		app.registerInitializeTask(token);
		$AppConfig.service.getPageInfo(Globals.CONTENT_ROOT, pass, fail, this);
	},


	showNoteViewer: function(sel,rec){
		var me = this,
			block = sel.mon(sel,{
			destroyable: true,
			beforeselect: function(){this.deselectingToSelect=true;},
			beforedeselect: function(s,r){
				var w = me.activeNoteWindow,
					allow = this.deselectingToSelect && (!w || w.close());

				if( allow ){
					delete this.deselectingToSelect;
				}

				return allow || (r!==rec); }
		});

		function deselect(){
			block.destroy();
			sel.deselect(rec);
		}

		me.activeNoteWindow = Ext.widget('note-window',{
			autoShow: true,
			record: rec,
			listeners:{beforedestroy:deselect}
		});
	},


	changeActionMap: {
		/**
		 * Stubs that show what we could handle. They will be called with these args:
		 *
		 *	@param change Object/Ext.data.Model -  the change record.
		 *	@param item Object/Ext.data.Model - Item the change is about.
		 *	@param meta Object - Location meta data
		 *
		 * these are assigned in the init() above
		 */
		created: Ext.emptyFn,
		deleted: Ext.emptyFn,
		modified: Ext.emptyFn,
		shared: Ext.emptyFn,
		circled: Ext.emptyFn
	},


	incomingChange: function withMeta(change, meta, reCalled) {
		//fancy callback that calls this function back with addtional arguments
		function reCall(meta){ 
			var c = ParseUtils.parseItems([change.raw])[0];
			withMeta.call(me,c,meta,true); 
		}

		//we require at least a change object
		if(!change){
			console.error('Invalid Argument for change');
			return;
		}

		//if this is the raw json from the event, parse it.
		if(!change.isModel){ change = ParseUtils.parseItems([change])[0]; }

		var me = this,
			item = change.get('Item'),
			cid = change.getItemValue('ContainerId'),
			type = (change.get('ChangeType')||'').toLowerCase(),//ensure lowercase
			fn;

		//only call this on first call
		if(!reCalled){
			//update the stream
			this.getController('Stream').incomingChange(change);
			this.getController('Profile').incomingChange(change);
			this.getController('Forums').incomingChange(change);
		}

		//callback with ourself, only if we haven't already and there is a containerId to resolve
		if(!meta && !reCalled && cid){ LocationMeta.getMeta(cid,reCall,me); return; }

		//if there was a container id, but it didn't resolve, we're in trouble.
		if(!meta && cid){
			console.warn('No meta data for Container: '+cid);
			return;
		}

		try{
			//Now that all the data is in order, lets dole out the responsibility to chageType specific functions and,
			// btw... Ext.callback handles unmapped actions for us. (if the callback is not a function, then it just
			// returns)
			fn = me.changeActionMap[type];
			//But for sake of logging, lets test it.
			if(!fn){ console.warn('"'+type+'" Change is not being handled:',change); }
			Ext.callback(fn,me,[change,item,meta]);
		}
		catch(e2){
			console.error(Globals.getError(e2));
		}
	},


	incomingCreatedChange: function(change,item,meta){
		var cid = item.get('ContainerId'),
			actedOn = false,
			recordForStore = item;

		this.applyToStoresThatWantItem(function(id,store){
			if(store){
				actedOn = true;
				console.log(store, cid);

				if(store.findRecord('NTIID',item.get('NTIID'),0,false,true,true)){
					console.warn('Store already has item with id: '+item.get('NTIID'), item);
				}

				if(!recordForStore){
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

		if(!actedOn){
			console.warn('We did not act on this created change event:',change,' location meta:',meta);
		}
	},


	incomingDeletedChange: function(change,item,meta){
		var cid = item.get('ContainerId'),
			actedOn = false;

		this.applyToStoresThatWantItem(function(id,store){
			var r;
			if(store){
				actedOn = true;
				console.log(store, cid);
				r = store.findRecord('NTIID',item.get('NTIID'),0,false,true,true);
				if(!r){
					console.warn('Could not remove, the store did not have item with id: '+item.get('NTIID'), item);
					return;
				}

				//The store will handle making it a placeholder if it needs and fire events,etc... this is all we need to do.
				store.remove(r);
			}
		}, item);

		if(!actedOn){
			console.warn('We did not act on this created change event:',change,' location meta:',meta);
		}
	},


	incomingModifiedChange: function(change,item,meta){
		var cid = item.get('ContainerId'),
			actedOn = false;

		this.applyToStoresThatWantItem(function(id,store){
			var r;
			if(store){
				actedOn = true;
				console.log(store, cid);
				r = store.findRecord('NTIID',item.get('NTIID'),0,false,true,true);
				if(!r){
					console.warn('Store already has item with id: '+item.get('NTIID'), item);
					store.add(item);
					return;
				}
				//apply all the values of the new item to the existing one
				r.set(item.asJSON());
				r.fireEvent('updated',r);
				r.fireEvent('changed');
			}
		}, item);

		if(!actedOn){
			console.warn('We did not act on this created change event:',change,' location meta:',meta);
		}
	},


	incomingSharedChange: function(change,item,meta){
		console.warn('what would we do here? treading as a create.');
		this.incomingCreatedChange.apply(this,arguments);
	},


	onRecordDestroyed: function(record){
		if(!Ext.isEmpty(record.stores)){return;}

		this.applyToStoresThatWantItem(function(key,store){
			store.removeByIdsFromEvent(record.getId(),true);
		},record);
	},


	listenToPageStores : function(monitor, listeners){
		monitor.mon(this.pageStoreEvents,listeners);
	},


	setupPageStoreDelegates: function(cmp){
		var delegate,
			delegates = {
			clearPageStore: Ext.bind(this.clearPageStore,this),
			addPageStore: Ext.bind(this.addPageStore,this),
			getPageStore: Ext.bind(this.getPageStore,this),
			hasPageStore: Ext.bind(this.hasPageStore,this),
			applyToStores: Ext.bind(this.applyToStores,this),
			applyToStoresThatWantItem: Ext.bind(this.applyToStoresThatWantItem,this)
		};

		for( delegate in delegates){
			if(delegates.hasOwnProperty(delegate)){
				if(cmp[delegate]){
					console.warn('[W] !!!Overwritting existing property: '+delegate+' on '+cmp.id,cmp);
				}
				cmp[delegate] = delegates[delegate];
			}
		}
	},


	initPageStores: function(){
		//init the page store.
        var currentPageStoresMap = {};
		this.pageStoreEvents = new Ext.util.Observable();
		ObjectUtils.defineAttributes(this,{
			currentPageStores: {
				getter: function(){return currentPageStoresMap;},
				setter: function(s){
					var key, o, m = currentPageStoresMap||{};
					currentPageStoresMap = s;
					for(key in m){
						if(m.hasOwnProperty(key)){
							o = m[key]; delete m[key];
							if(o){
								if(!o.doesNotClear){
									o.fireEvent('cleanup');
									o.clearListeners();
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



		this.flatPageStore = this.getFlatPageStore();

	},


	clearPageStore: function(){
		this.currentPageStores = {};//see above defineAttributes call
		this.flatPageStore.removeFilter('lineFilter');
		this.flatPageStore.removeAll();
	},


	hasPageStore: function(id){
		return !id ? false : (this.currentPageStores||{}).hasOwnProperty(id);
	},


	addPageStore: function(id,store){
		var events = this.pageStoreEvents, monitors = events.managedListeners||[];
		if(this.hasPageStore(id) && this.getPageStore(id) !== store){
			console.warn('replacing an existing store??');
		}

		store.cacheMapId = store.cacheMapId || id;

		this.currentPageStores[id] = store;

		this.flatPageStore.bind(store);
		store.on({
			scope: this,
			load:'fillInUsers',
			add: 'fillInUsers'
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
		if(store.doesNotShareEventsImplicitly){
			return;
		}

		//Because root is just an alias of the NTIID store that represents the page root, it was causing two monitors
		// to be put on the store...so we will skip stores we are already monitoring
		if(Ext.Array.contains(Ext.Array.pluck(monitors,'item'),store)){
			//This prevents two invocations of event handlers for one event.
			return;
		}

		store.on('cleanup','destroy',
			events.relayEvents(store, ['add','bulkremove','remove']));
	},


	getPageStore: function(id){
		var theStore, root;
		if(!id){ Ext.Error.raise('ID required'); }

		function bad(){ console.error('There is no store for id: '+id); }
		theStore =  this.currentPageStores[id];
		if(!theStore){
			root = this.currentPageStores.root;
			if(root && (id === root.containerId)){
				theStore = root;
			}
		}
		return theStore || { bad: true, add: bad, getById: bad, remove: bad, on:bad, each:bad, un:bad, getItems: bad, getCount: bad };
	},


	//Calls the provided fn on all the stores.  Optionally takes a predicate
	//which skips stores that do not match the predicate
	applyToStores: function(fn, predicate){
		Ext.Object.each(this.currentPageStores,function(k){
			if(k==='root'){return;}//root is an alisas of the ntiid
			if(!Ext.isFunction(predicate) || predicate.apply(null, arguments)){
				Ext.callback(fn,null,arguments);
			}
		});
	},


	applyToStoresThatWantItem: function(fn, item){
		function predicate(id, store){
			return store && store.wantsItem(item);
		}
		this.applyToStores(fn, predicate);
	},



	fillInUsers: function(store, records){
		var users = Ext.Array.map(records||[],function(r){return r.get('Creator');});

		function apply(r,i){
			var u = users[i],
				id = u.getId(),
				c = r.get('Creator');

			if(c !== id && !Ext.isString(c) && c && c.getId() !== id){
				console.error('Bad mapping:', c, id, records, users, i);
				return;
			}

			if(c && !c.isModel){
				r.set('Creator',u);
			}
		}

		UserRepository.getUser(users,function(u){
			users = u;

			store.suspendEvents(true);
			Ext.each(records,apply);
			store.resumeEvents();

		});
	},





	openChatTranscript: function(records, clonedWidgetMarkup){
		if(!Ext.isArray(records)){ records = [records]; }
		var w = Ext.widget('chat-transcript-window',{waitFor: records.length, errorMsgSupplement:clonedWidgetMarkup});
		function loadTranscript(r){
			if(r.isTranscript){
				//its a transcript so load it straight to the window
				w.insertTranscript(r);
			}else{
				//its a summary so get the transcript first
				this.onLoadTranscript(r,w);
			}
		}
		Ext.each(records,loadTranscript, this);
	},


	onAnnotationsLineFilter: function(line){
		var s = this.flatPageStore;

		s.removeFilter('lineFilter');
		if(line){
			s.addFilter({
				id: 'lineFilter',
				filterFn: function(r){
					return r.get('line') === line;
				}
			});
		}
	},


	maybeRemoveLineFilter: Ext.Function.createBuffered(function(){
		var s = this.flatPageStore;
		if( s.getCount() === 0 ){
			s.removeFilter('lineFilter');
		}
	},1),


	onAnnotationsFilter: function(cmp){
		var listParams = FilterManager.getServerListParams(),
			filter = ['TopLevel'];

		if(listParams.filter){
			filter.push(listParams.filter);
		}

		function loaded(store,records,success){
			var bins = store.getBins();

			if(!success){
				return;
			}

			cmp.getAnnotations().objectsLoaded(store.getItems(bins), bins, store.containerId);
		}

		function containerStorePredicate(k, s){
			return s.hasOwnProperty('containerId');
		}

		this.applyToStores(function(k,s){
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

			if(!Ext.isEmpty(filter)){
				params.filter = filter.join(',').replace(/,+$/,'');
			}
			if(listParams.accept){
				params.accept = listParams.accept;
			}
			if(!Ext.isEmpty(listParams.sharedWith)){
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
			ps = Store.make(pi.getLink(rel),containerId,true),
			me = this;

		containers = containers || [];

		this.clearPageStore();

		this.addPageStore('root',ps);//add alias of root store

		if(!Ext.Array.contains(containers, containerId)){
			containers.push(containerId);
		}

		Ext.each(containers,function(id){
			me.addPageStore(id,(containerId === id)?//ensure we don't duplicate the root store
				ps : Store.make(pi.getSubContainerURL(rel,id),id));
		});

		this.onAnnotationsFilter(cmp);
	},


	saveSharingPrefs: function(pageInfo, prefs, callback){
		//TODO - check to see if it's actually different before save...

		//get parent:
		$AppConfig.service.getPageInfo(ContentUtils.getLineage(pageInfo.getId()).last(),
			function(topPi){
				if (topPi){
					topPi.saveField('sharingPreference', {sharedWith: prefs}, function(fieldName, sanitizedValue, pi, refreshedPageInfo){
						//always happens if success only:
						me.updatePreferences(refreshedPageInfo);
						Ext.callback(callback, null, []);
					});
				}
			},
			function(){
				console.error('failed to save default sharing');
			},
		this);


	},


	updatePreferences: function(pi) {
		if(Ext.isArray(pi)){
			Ext.each(pi,this.updatePreferences,this);
			return;
		}

		var sharing = pi.get('sharingPreference'),
            piId = pi.getId(),
            rootId = ContentUtils.getLineage(piId).last();

        if (!this.preferenceMap){this.preferenceMap = {};}

        if (sharing && /inherited/i.test(sharing.State) && rootId === sharing.Provenance) {
            //got a sharing value from the root id, add it to the map
            piId = rootId;
        }
        else if(!sharing || (!/set/i.test(sharing.State) && piId !== rootId)){
            console.debug('Not setting prefs', sharing, (sharing||{}).State);
            return;
        }		this.preferenceMap[piId] = {sharing: sharing};
		console.debug('shareing prefs updated', this.preferenceMap[piId]);
	},


	setupPagePreferences: function(cmp){
		cmp.getPagePreferences = Ext.bind(this.getPreferences,this);
	},


	getPreferences: function(ntiid) {
		if (!this.preferenceMap || !ntiid) {
			return null;
		}

        var lineage = ContentUtils.getLineage(ntiid), result=null;
        Ext.each(lineage, function(l){result = this.preferenceMap[l]; return !result; }, this);
        return result;
	},


	define: function(term, boundingScreenBox, reader){

		if( this.definition ){
			this.definition.close();
			delete this.definition;
		}
		this.definition = Ext.widget(
			'definition-window',{
			term: term,
			pointTo: boundingScreenBox,
			reader: reader
		}).show();
	},


	onShareWithSaveClick: function(btn){
		var win = btn.up('window'),
			shbx= win.down('user-sharing-list'),
			v = shbx.getValue(),
			rec = win.record, b, newSharedWith,
			cb = win.down('checkbox'),
			saveAsDefault = cb ? cb.checked : false,
			me = this;

		//extra check here for a close...
		if (btn.text === 'Close'){
			win.close();
			return;
		}

		if (!rec){return;}

		win.el.mask('Sharing...');

		//Clean the body
		//FIXME seems strange we should have to clean the body here...
		b = rec.get('body');
		if(Ext.isArray(b)){
			b = Ext.Array.clean(b);
		}
		rec.set('body', b);

		newSharedWith = SharingUtils.sharedWithForSharingInfo(v);

		if(cb){
			cb.setValue(false);
		}
		if (saveAsDefault){
			//update default sharing setting if we have a shareWith:
			me.saveSharingPrefs(SharingUtils.sharedWithForSharingInfo(v));
		}

		if(Globals.arrayEquals(rec.get('sharedWith') || [], newSharedWith || [])){
			console.log('Sharing not mutated.  Not showing changes', rec.get('SharedWith'), newSharedWith);
			win.close();
			return;
		}
		SharingUtils.setSharedWith(rec, newSharedWith, function(newRec,op){
			if(op.success){
				rec.fireEvent('updated',newRec);
				win.close();
			}
			else{
				console.error('Failed to save object');
				alert('Opps!\nCould not save');
				win.el.unmask();
			}
		});
	},


	onDismissPopover: function() {
		var me = this;
		if (me.popoverWidget){
			me.popoverWidget.startCloseTimer();
		}
	},


	onDisplayPopover: function(sender, id, html, node) {
		var offsets = sender.getAnnotationOffsets(),
			position = Ext.fly(node).getXY(),
			me=this;

		function adjustPosition(position){
			var horizontalSpaceNeeded = me.popoverWidget.getWidth()/2;

			//adjust position depending on whether it should be shown on top or bottom
			if ((position[1] -offsets.scrollTop) < me.popoverWidget.getHeight()) {
				//bottom
				position[1] = position[1] + offsets.top + 30;
				me.popoverWidget.addCls('top');
			}
			else{
				//top
				position[1] = position[1] + offsets.top;
				position[1] = position[1] - me.popoverWidget.getHeight() - 20;
				me.popoverWidget.addCls('bottom');
			}

			//adjust position for left and right.  If we can be centered above it
			//we allow that, otherwise we move the bubble left and right
			if(position[0] + horizontalSpaceNeeded > Ext.Element.getViewportWidth()){
				//the bubble needs to shift left, marker on the right
				position[0] = position[0] - (horizontalSpaceNeeded * 2) + 20;
				me.popoverWidget.addCls('right');
			}
			else if(position[0] - horizontalSpaceNeeded < 0){
				//bubble needs to shift right, arrow on left
				position[0] = position[0] - 66;
				me.popoverWidget.addCls('left');
			}
			else{
				//centered
				position[0] = position[0] - (me.popoverWidget.width/2);
			}
			position[0] += 80;

			return position;
		}

		if (me.popoverWidget){
			me.popoverWidget.destroy();
			delete this.popoverWidget;
		}

		Ext.fly(html).select('a[href]', true).set({target:'_blank'});

		me.popoverWidget = Ext.widget('simple-popover-widget', {text: html.innerHTML});
		me.popoverWidget.showAt(adjustPosition(position));
	},


	onLoadTranscript: function(record, cmp) {
		var model = this.getModel('Transcript'),
			id = record.get('RoomInfo').getId();

		model.getProxy().url = record.getLink('transcript');

		model.load(id,{
			scope: this,
			failure: function() {
				cmp.failedToLoadTranscript();
			},
			success: function(record) {
				cmp.insertTranscript(record);
			}
		});
	},


	saveNewBookmark: function(reader){
		//create a bookmark model
		var me = this,
			bm = me.getBookmarkModel().create({
			ContainerId: reader.getLocation().NTIID,
			applicableRange: NextThought.model.anchorables.ContentRangeDescription.create()
		});

		//now save this:
		bm.save({
			callback:function(record, operation){
				try{
					if (operation.success){
						me.fireEvent('bookmark-loaded', record);
					}
				}
				catch(err){
					console.error('Something went teribly wrong... ', Globals.getError(err));
				}
			}
		});
	},


	getSaveCallback: function(callback){
		var me = this;
		return function(record, operation){
			var success = operation.success, rec;
			console.log('Note save callback', success, operation);
			try{
				rec = success ? ParseUtils.parseItems(operation.response.responseText)[0] : null;
				if (success){
					me.incomingCreatedChange({}, rec, {});
					AnnotationUtils.addToHistory(rec);
				}
			}
			catch(err){
				console.error('Something went teribly wrong... ',err);
			}
			Ext.callback(callback, this, [success, rec]);
		};
	},


	saveNewNote: function(title, body, range, c, shareWith, style, callback){
		//check that our inputs are valid:
		if (!body || (Ext.isArray(body) && body.length < 1)){
			console.error('Note creating a note missing content');
			return;
		}

		if(!range){
			console.log('No range supplied, note will be anchored to container only');
		}

		console.log('Saving new note with body', body);

		//Define our vars and create our content range description:
		var doc = range ? range.commonAncestorContainer.ownerDocument : null,
			noteRecord,
			rangeDescription = Anchors.createRangeDescriptionFromRange(range, doc),
			container = c;

		if(!container){
			console.error('No container supplied pulling container from rangeDescription', rangeDescription);
			container = rangeDescription.container;
		}

		//make sure the body is an array:
		if(!Ext.isArray(body)){body = [body];}

		//If a user it not allowed to share, remove any shared with fields
		if (!$AppConfig.service.canShare()){
			shareWith = [];
		}
		//apply default sharing
		else if(Ext.isEmpty(shareWith)){
			shareWith = ((this.getPreferences(container)||{}).sharing||{}).sharedWith || [];
		}

		//define our note object:
		noteRecord = this.getNoteModel().create({
			applicableRange: rangeDescription.description,
			body: body,
			title:title,
			selectedText: range ? range.toString() : '',
			sharedWith: shareWith,
			style: style,
			ContainerId: container
		});

		console.log('Saving new record', noteRecord);
		noteRecord.getProxy().on('exception', this.handleException, this, {single:true});
		//now save this:
		noteRecord.save({ scope: this, callback:this.getSaveCallback(callback)});
	},


	handleException: function(proxy, response, operation){
		var error,
			msg = "An unknown error occurred saving your note.";

		try{
			//TODO We can get other information from different parts of the response.
			//if it isn't json look elsewhere
			error = JSON.parse(response.responseText) || {};
		}
		catch(e){
			error = {};
		}

		if(error.code === "TooLong"){
			msg = 'Could not save your note. The title is too long. It should be 140 characters or less.';
		}
		alert({title: 'Error', msg: msg, icon: 'warning-red'});
		console.warn('Exception Message: ', response.responseText);
	},


	savePreviewNoteReply: function(editor,record,valueObject,successCallback){
		var cmp = editor.up('[record]'),
			isEdit = Boolean(record),
			replyToRecord = cmp && cmp.record;

		function callback(success, rec){
			if(success){
				Ext.callback(successCallback, null, [editor, cmp, rec]);
			}
			else{
				console.error('Could not save your reply: ', arguments);
			}
		}

		if(isEdit){
			record.set({ body:valueObject.body });
			try{
				record.save({
					callback: function(record, request){
						var success = request.success,
							rec = success ? request.records[0]: null;
						if(success){
							Ext.callback(successCallback, null, [editor, cmp, rec]);
						}
					}
				});
			}
			catch(e){
				console.error('FAIL: could not save the record properly! ', e);
			}
		} else{
			this.saveNewReply(replyToRecord, valueObject.body, valueObject.sharedWith, callback);
		}
	},


	saveNewReply: function(recordRepliedTo, replyBody, shareWith, callback) {
		//some validation of input:
		if(!recordRepliedTo){Ext.Error.raise('Must supply a record to reply to');}
		if (!Ext.isArray(replyBody)){ replyBody = [replyBody];}

		//define our note object:
		var replyRecord = recordRepliedTo.makeReply();
		replyRecord.set('body', replyBody);
		console.log('Saving reply', replyRecord, ' to ', recordRepliedTo);

		//now save this:
		replyRecord.save({ scope: this, callback:this.getSaveCallback(callback)});
	},


	deleteNoteReply: function(record, cmp, callback){
		if(!record){ return; }

		record.destroy({
			success: function(){
				//TODO: do we need to look through all the store to see who cares about this record? or it's already handled.
				Ext.callback(callback, null, [cmp]);
			},
			failure: function(){
				alert('Sorry, could not delete that');
			}
		});
	},


	replyAsChat: function(record) {
		var top = record,
			people, cId, parent, refs;

		//go to the top, it has the info we need:
		while(top.parent) {
			top = top.parent;
		}


		people = Ext.Array.unique([record.get('Creator')].concat(top.get('sharedWith')).concat(top.get('Creator')));
		cId = record.get('ContainerId');
		parent = record.get('NTIID');
		refs = (record.get('references') || []).slice();

		this.getController('Chat').enterRoom(people, {ContainerId: cId, references: refs, inReplyTo: parent});
	},


	savePhantomAnnotation: function(record, applySharing, successFn, failureFn){
		function callback(success,rec){
			Ext.callback(success?successFn:failureFn,null,[record,rec]);
		}

		var p = null;

		if(applySharing){
			p = ((this.getPreferences(record.get('ContainerId'))||{}).sharing||{}).sharedWith || null;
		}
		record.set('SharedWidth',p);

		record.save({ scope: this, callback:this.getSaveCallback(callback) });
	},


	shareWith: function(record){
		var options = {};

		if (Ext.ComponentQuery.query('share-window[record]').length > 0) {
			//already a share with window, they are modal, just don't do this:
			return;
		}

		if (arguments[arguments.length-1] === true) {
			options = {
				btnLabel : 'Discuss',
				titleLabel : 'Discuss This...'
			};
		}

		Ext.widget('share-window',Ext.apply({record: record}, options)).show();
	},


	redact: function(record){
		if(!record) {
			return;
		}
		this.self.events.fireEvent('new-redaction',record);
	}

});
