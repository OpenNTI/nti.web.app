export default Ext.define('NextThought.app.profiles.user.components.activity.parts.Stream', {
	extend: 'NextThought.app.stream.List',
	alias: 'widget.profile-user-activity-stream',

	requires: [
		'NextThought.app.profiles.user.components.activity.parts.Page',
		'NextThought.app.profiles.user.components.activity.parts.events.Empty'
	],


	userChanged: function(user) {
		var joined;

		this.user = user;
		if (this.hasInitialWidget() && this.rendered) {
			joined = this.down('joined-event');
			if (joined && joined.setUser) {
				joined.setUser(this.user);
			}
		}
	},


	initialWidgetConfig: function() {
		return { xtype: 'joined-event', username: this.user };
	},

	hasInitialWidget: function() {
		return !!this.down('joined-event');
	},


	getPageConfig: function(items) {
		return {
			xtype: 'profile-stream-page',
			records: items,
			user: this.user,
			navigateToObject: this.navigateToObject.bind(this)
		};
	},


	loadBatch: function(batch) {
		if (batch.Items.length) {
			this.removeEmpty();
			this.fillInItems(batch.Items);
		} else if (batch.isFirst && this.getPageCount() === 0) {
			this.onEmpty(batch);
		}

 		if (batch.isLast) {
			this.onDone(this.StreamSource);
 			this.isOnLastBatch = true;
 		}
 	},


	onDone: function(streamSource) {
		var config = this.initialWidgetConfig();

		if (this.shouldAddJoinedEvent(streamSource)) {
			if (!this.hasInitialWidget()) {
				this.joinedCmp = this.add(config);
			}
		} else if (this.joinedCmp) {
			this.joinedCmp.destroy();
		}
	},


	onEmpty: function(batch) {
		var cmp = this.getGroupContainer(),
			hasFilters = this.hasFiltersApplied(batch),
			title, subtitle;

		if (!this.emptyCmp) {
			this.emptyCmp = cmp.add({
				xtype: 'profile-activity-part-empty',
				hasFilters: hasFilters
			});
		}
	},


	hasFiltersApplied: function(batch) {
		var s = this.StreamSource;

		if (batch && batch.FilteredTotalItemCount !== batch.TotalItemCount) {
			return true;
		}

		if (!batch && s) {
			return (s.extraParams && s.extraParams.value) || (s.accepts && s.accepts.value) || (s.filters && s.filters.value);
		}

		return false;
	},


	shouldAddJoinedEvent: function(source) {
		var extra = source && source.extraParams,
			createdTime = this.user && this.user.get('CreatedTime'),
			inSeconds = (createdTime && createdTime.getTime()) / 1000;

		if (extra && extra.batchAfter && !isNaN(inSeconds)) {
			return inSeconds > extra.batchAfter;
		}

		if (source.accepts && source.accepts.value) {
			return false;
		}

		return true;
	}
});


// Ext.define('NextThought.app.profiles.user.components.activity.parts.Stream', {
// 	extend: 'Ext.container.Container',
// 	alias: 'widget.profile-user-activity-stream',

// 	requires: [
// 		'NextThought.app.profiles.user.components.activity.parts.events.ActivityItem',
// 		'NextThought.app.profiles.user.components.activity.parts.events.ActivityItemReply',
// 		'NextThought.app.profiles.user.components.activity.parts.events.Badge',
// 		'NextThought.app.profiles.user.components.activity.parts.events.Blogged',
// 		'NextThought.app.profiles.user.components.activity.parts.events.BlogReply',
// 		'NextThought.app.profiles.user.components.activity.parts.events.ForumActivityItem',
// 		'NextThought.app.profiles.user.components.activity.parts.events.HighlightContainer',
// 		'NextThought.app.profiles.user.components.activity.parts.events.Joined',
// 		'NextThought.app.profiles.user.components.activity.parts.events.NoteReply',
// 		'NextThought.app.profiles.user.components.activity.parts.events.PostReply',
// 		'NextThought.app.profiles.user.components.activity.parts.events.TopicReply',
// 		'NextThought.app.profiles.user.components.activity.parts.events.TranscriptSummaryItem',
// 		'NextThought.store.ProfileItem'
// 	],

// 	layout: 'none',

// 	DEFAULT_URI: 0,
// 	ACTIVE_ACTION_URI: 1,

// 	defaultType: 'profile-activity-item',
// 	ui: 'profile-activity',
// 	cls: 'activity',

// 	items: [],


// 	initComponent: function() {
// 		this.callParent(arguments);

// 		this.onScroll = this.onScroll.bind(this);

// 		this.on({
// 			activate: this.onActivate.bind(this),
// 			deactivate: this.onDeactivate.bind(this)
// 		});
// 	},


// 	onActivate: function() {
// 		window.addEventListener('scroll', this.onScroll);
// 	},


// 	onDeactivate: function() {
// 		window.removeEventListener('scroll', this.onScroll);
// 	},


// 	initialWidgetConfig: function() {
// 		return { xtype: 'joined-event', username: this.user };
// 	},

// 	hasInitialWidget: function() {
// 		return !!this.down('joined-event');
// 	},

// 	onAdd: function(cmp) {
// 		this.callParent(arguments);
// 		cmp.addCls('activity-event-item');
// 	},


// 	setStore: function(store, user) {
// 		if (!this.rendered) {
// 			this.on('afterrender', this.setStore.bind(this, store));
// 			return;
// 		}

// 		if (this.store) {
// 			this.removeAll(true);
// 		}

// 		if (this.storeListeners) {
// 		   this.storeListeners.destroy();
// 		}

// 		this.store = store;
// 		this.user = user;

// 		this.storeListeners = this.mon(this.store, {
// 			destroyable: true,
// 			add: this.itemsAddedToStore.bind(this),
// 			load: this.storeLoaded.bind(this),
// 			beforeload: this.showLoadingBar.bind(this),
// 			remove: function() { console.debug('Removed item(s)'); },
// 			bulkremove: function() { console.debug('Bulk Removed item(s)'); }
// 		});

// 		if (this.store.getCount()) {
// 			this.storeLoaded(this.store, this.store.data.items, true);
// 		} else {
// 			this.store.load({page: 1, callback: this.loadCallback.bind(this)});
// 		}
// 	},


// 	showLoadingBar: function() {
// 		console.log('Show loading bar');
// 		//TOOD how to get the height into css.  If we don't specify it here it gets an
// 		//inline styled height
// 		this.add({
// 			xtype: 'box',
// 			cls: 'loading-bar',
// 			itemId: 'loadingbar',
// 			height: 40,
// 			frame: false, border: false, plain: true,
// 			listeners: {
// 				afterrender: {
// 					fn: function(cmp) {
// 						Ext.defer(function() {
// 							if (cmp.el && cmp.el.dom) {
// 								cmp.el.mask(getString('NextThought.view.profiles.outline.View.loading'));
// 							}
// 						},1);
// 					},
// 					single: true
// 				}
// 			}});
// 	},


// 	clearLoadingBar: function() {
// 		var bar = this.down('#loadingbar');
// 		console.log('Clear loading bar');
// 		if (bar) {
// 			this.remove(bar);
// 		}
// 	},


// 	cmpsFromRecords: function(records) {
// 		var me = this,
// 			cmps = [], lastHighlightContainer, user = me.user;

// 		function getDate(rec) {
// 			var d = rec.get('CreatedTime') || new Date(0);
// 			return new Date(
// 					d.getFullYear(),
// 					d.getMonth(),
// 					d.getDate());
// 		}

// 		function newContainer(rec) {
// 			lastHighlightContainer = {
// 				xtype: 'profile-activity-highlight-container',
// 				date: getDate(rec),
// 				user: user,
// 				items: [rec],
// 				navigateToObject: me.navigateToObject.bind(me)
// 			};
// 			cmps.push(lastHighlightContainer);
// 		}

// 		(records || []).forEach(function(i) {
// 			if (/change$/.test(i.get('MimeType'))) {
// 				i = i.getItem();
// 			}

// 			//if we don't have a record don't try to make a component for it
// 			if (!i) { return; }

// 			var c = (i.get('Class') || 'default').toLowerCase(),
// 				reply = (i.isTopLevel && !i.isTopLevel() && '-reply') || '',
// 				n = 'profile-activity-' + c + reply + '-item',
// 				alias = 'widget.' + n;

// 			if (c === 'highlight') {
// 				//This may simplify to line-item-like activity items in the future
// 				if (lastHighlightContainer && lastHighlightContainer.date.getTime() === getDate(i).getTime()) {
// 					lastHighlightContainer.items.push(i);
// 				}
// 				else {
// 					newContainer(i);
// 				}
// 				return;
// 			}

// 			if (Ext.isEmpty(Ext.ClassManager.getNameByAlias(alias), false)) {
// 				console.error('Unsupported type: ', n, ' record: ', i, ', skipping');
// 				return;
// 			}

// 			cmps.push({record: i, root: true, user: user, xtype: n, navigateToObject: me.navigateToObject.bind(me)});
// 		});

// 		return cmps;
// 	},


// 	loadCallback: function(records, operation, success) {
// 		if (!success && operation.error && operation.error.status === 404) {
// 			//If we don't have a joined-event child add one now
// 			if (!this.hasInitialWidget()) {
// 				this.add(this.initial(initialWidgetConfig));
// 			}
// 		}
// 	},


// 	storeLoaded: function(store, records, successful) {
// 		if (!successful) {
// 			this.clearLoadingBar();
// 			return;
// 		}

// 		console.log('loaded ', records.length, ' items ');

// 		//For now we only do top level stuff
// 		records = records.filter(function(rec) {

// 			//If it responds to isTopLevel and it is
// 			//not top level we don't want it.
// 			//if (rec.isTopLevel && !rec.isTopLevel()) {
// 				//return false;
// 			//}

// 			//To we are a root (toplevel) object here
// 			//we also don't want placeholders.  The ds only sends
// 			//us true top level notes in Activity so filter them out
// 			//locally if they sneak in
// 			return !rec.placeholder;
// 		});


// 		var add = this.cmpsFromRecords(records),
// 			s = this.store,
// 			done = s.currentPage === s.getPageFromRecordIndex(s.getTotalCount()),
// 			added, lastAdded;

// 		if (done) {
// 			add.push(this.initialWidgetConfig());
// 		}

// 		this.clearLoadingBar();

// 		console.log('Showing', this.items.length, ' objects ');
// 		added = this.add(add) || [];
// 		if (!Ext.isEmpty(added)) {
// 			lastAdded = added.last();
// 			if (lastAdded.rendered) {
// 				this.maybeShowMoreItems();
// 			}
// 			else {
// 				lastAdded.on('afterrender', this.maybeShowMoreItems, this, {single: true});
// 			}
// 		}
// 		else {
// 			this.maybeShowMoreItems();
// 		}
// 	},


// 	itemsAddedToStore: function(store, records, index) {
// 		var cmps;
// 		console.log('Records added at index', index, records);

// 		//For now we only do top level stuff
// 		records = Ext.Array.filter(records, function(rec) {
// 			return !rec.isTopLevel || rec.isTopLevel();
// 		});


// 		if (Ext.isEmpty(records)) {
// 			return;
// 		}

// 		//Here is where we could loop over existing cmps and ask them if
// 		//they want to handle addition.  That is one way we could support
// 		//coalescing highlights as they are added live.=

// 		//We don't maintain a sorted store so assume things
// 		//coming in an add method are the most recent.  Therefore
// 		//we just sort them adn stick them at the top
// 		records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime'));
// 		cmps = this.cmpsFromRecords(records);
// 		this.add(0, cmps);
// 	},


// 	maybeShowMoreItems: function() {
// 		var viewportHeight = Ext.Element.getViewportHeight(),
// 			minCount = viewportHeight / 100,
// 		me = this;

// 		if (minCount > this.items.getCount()) {
// 			console.log('loading the next page. ', minCount, this.items.getCount());
// 			me.prefetchNext();
// 		}
// 	},


// 	onScroll: function() {
// 		var scroll = Ext.getBody().getScroll(),
// 			//TODO: figure out how to not have to do a user agent check for this
// 			el = Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body,
// 			height = document.documentElement.clientHeight;

// 		if (scroll.top + height >= el.scrollHeight) {
// 			this.onScrolledToBottom();
// 		}
// 	},


// 	onScrolledToBottom: function() {
// 		this.prefetchNext();
// 	},


// 	onParentScroll: function() {
// 		this.items.each(function(i) {
// 			if (i.maybeFillIn) {
// 				i.maybeFillIn();
// 			}
// 		});
// 	},

// 	prefetchNext: function() {
// 		var s = this.store, max;

// 		if (!s.hasOwnProperty('data')) {
// 			return;
// 		}

// 		max = s.getPageFromRecordIndex(s.getTotalCount());
// 		if (s.currentPage < max && !s.isLoading()) {
// 			console.log('Fetching next page of data', s);
// 			s.clearOnPageLoad = false;
// 			s.nextPage({callback: this.loadCallback, scope: this});
// 		}
// 	}
// });
