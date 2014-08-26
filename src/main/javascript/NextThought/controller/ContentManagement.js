Ext.define('NextThought.controller.ContentManagement', {
	extend: 'Ext.app.Controller',

	models: [
		'ContentBundle'
	],


	stores: [
		'ContentBundles'
	],


	refs: [
		{ ref: 'mainNav', selector: 'main-navigation'},
		{ ref: 'contentView', selector: 'content-view-container' },
		{ ref: 'libraryView', selector: 'library-view-container' }
	],


	init: function() {
		this.application.on('session-ready', 'onSessionReady', this);

		var control = {
			component: {
				'*': {
					'bundle-selected': 'onBundleSelected'
				}
			},
			controller: {
				'*': {
					'bundle-selected': 'onBundleSelected'
				}
			}
		};

		this.listen(control, this);
	},

	onSessionReady: function() {
		var store = this.__setupStore('ContentBundles', (Service.getCollection('VisibleContentBundles', 'ContentBundles') || {}).href);

		if (store) {
			Promise.all([
				store.onceLoaded(),
				Library.onceLoaded()])
					.then(this.__fillIn.bind(this, store));

			store.load();
		}
	},


	__setupStore: function(storeId, source) {
		var store = Ext.getStore(storeId);
		store.proxy.url = getURL(source);
		if (Ext.isEmpty(source)) {
			store.load = function() { this.fireEvent('load', this, []); };
		}
		return store;
	},


	__isPackageReferenced: function(pkg) {
		var store = this.getContentBundlesStore(),
			recs = store.getRange(),
			NTIID = pkg.get('NTIID');

		function eq(id) { return id === NTIID; }

		function toID(o) { return o.get('NTIID'); }

		function ref(o) {
			return (o.get('ContentPackages') || []).map(toID).filter(eq).length > 0;
		}

		return recs.length && recs.filter(ref).length > 0;

	},


	__fillIn: function(store) {
		function badBundle(o) {
			return Ext.isEmpty(o.get('ContentPackages'));
		}

		var Model = this.getContentBundleModel(),
			refed = this.__isPackageReferenced.bind(this),
			wrapped = [],
			remove = store.getRange().filter(badBundle);

		if (remove.length > 0) {
			console.error('Removing bundles that appear bad:', remove);
			store.remove(remove);
		}

		Library.each(function(pkg) {
			if (!refed(pkg) && !pkg.get('isCourse')) {
				wrapped.push(Model.fromPackage(pkg));
			}
		});

		store.add(wrapped);
	},


	onBundleSelected: function(bundle, callback) {
		var view, txn;

		function end() {
			txn.commit();
		}

		txn = history.beginTransaction('navigation-transaction-' + guidGenerator());

		if (this.fireEvent('show-view', 'content', false) === false) {
			txn.abort();
			return false;
		}


		try {
			this.getMainNav().updateCurrent(false, bundle);
			view = this.getContentView();
			view.onBundleSelected(bundle)
					.then(callback)
					.always(end);
			return true;
		} catch (er) {
			end();
		}
	},

	onNavigateToForum: function(board, bundle, silent) {
		if (!bundle) { return; }

		var contentView = this.getContentView(),
			forumContainer, isNavigatingToForum = false,
			waitOn = Promise.resolve();

		//add logging to see why contentView.down('[isForumContainer]') is returning undefined... at least I think its returning undefined some times
		console.log('Looking for the forum container under:' + contentView.getId() + ',' + contentView.xtype + ',' + contentView.down('[isForumContainer]'));

		//if its silent, don't switch to the course or switch the tab
		if (silent) {
			return contentView.currentBundle === bundle &&
				   Promise.resolve(contentView.down('[isForumContainer]'));
		}

		if (this.fireEvent('show-view', 'content', true) === false) {
			return false;
		}

		//if we are already in the course just switch the tab
		if (contentView.currentBundle === bundle) {
			contentView.setActiveTab('course-forum');
		} else {
			//finally if we aren't in the course switch to it
			this.getMainNav().updateCurrent(false, bundle);
			waitOn = contentView.onBundleSelected(bundle, 'course-forum');
			isNavigatingToForum = true;
		}

		forumContainer = contentView.down('[isForumContainer]');
		forumContainer.isFromNavigatingToForum = isNavigatingToForum;

		return waitOn.then(function() {return forumContainer;});
	}

}, function() {

	var getPrefix = ParseUtils.ntiidPrefix.bind(ParseUtils);

	function prefix(ntiid) {
		var p = getPrefix(ntiid);
		return function(bundle) {
			return (bundle.get('ContentPackages') || []).filter(function(b) {return p === getPrefix(b.get('NTIID'));}).length > 0;
		};
	}

	window.ContentManagementUtils = {
		findBundle: function(thing) {
			console.error('[deprecated] This function is dangerious! Replace with prejudice!');
			var ntiid = ContentUtils.getNTIIDFromThing(thing);
			return Ext.getStore('ContentBundles').onceLoaded()
					.then(function(s) {
						var i = s.findBy(prefix(ntiid));
						return i >= 0 ? s.getAt(i) : Promise.reject('Not Found');
					});
		},
		findBundleBy: function(fn) {
			return Ext.getStore('ContentBundles').onceLoaded()
				.then(function(s) {
					var i = s.findBy(fn);

					return i >= 0 ? s.getAt(i) : Promise.reject('Not Found');
				});
		}
	};
});
