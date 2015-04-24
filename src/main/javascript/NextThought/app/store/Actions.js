Ext.define('NextThought.app.store.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.library.StateStore',
		'NextThought.app.store.StateStore'
	],


	constructor: function() {
		this.callParent(arguments);

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.Store = NextThought.app.store.StateStore.getInstance();

		if (this.LibraryStore.hasLoaded()) {
			this.loadPurchasables();
		} else {
			this.mon(this.LibraryStore, 'loaded', this.loadPurchasables.bind(this));
		}
	},


	loadPurchasables: function() {
		var service = window.Service,
			collection = service && service.getCollection('store', 'store'),
			link = collection && service.getLinkFrom(collection.Links, 'get_purchasables'),
			store = this.Store;


		if (!link) { return; }

		store.setLoading();

		StoreUtils.loadItems(getURL(link))
			.then(this.__updateLibraryWithPurchasables.bind(this))
			.then(store.setPurchasables.bind(store))
			.then(store.setLoaded.bind(store));
	},


	__updateLibraryWithPurchasables: function(items) {
		var library = this.LibraryStore;

		(items || []).forEach(function(p) {
			(p.get('Items') || []).forEach(function(itemId) {
				var title = library.getTitle(itemId);

				if (title) {
					title.set('sample', !p.get('Activated'));
				}
				else {
					console.warn('This purchasable item is not in the library:', itemId);
				}
			});
		});

		return items;
	}
});
