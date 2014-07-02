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
		var Model = this.getContentBundleModel(),
			refed = this.__isPackageReferenced.bind(this),
			wrapped = [];

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
			var ntiid = ContentUtils.getNTIIDFromThing(thing);
			return Ext.getStore('ContentBundles').onceLoaded()
					.then(function(s) {
						var i = s.findBy(prefix(ntiid));
						return i >= 0 ? s.getAt(i) : Promise.reject('Not Found');
					});
		}
	};
});
