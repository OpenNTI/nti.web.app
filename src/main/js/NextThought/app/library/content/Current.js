Ext.define('NextThought.app.library.content.Current', {
	extend: 'NextThought.app.library.components.Current',
	alias: 'widget.library-current-content',

	requires: [
		'NextThought.app.library.content.StateStore',
		'NextThought.app.store.StateStore',
		'NextThought.app.library.components.Collection'
	],

	layout: 'none',
	title: 'Books',

	storeModel: 'NextThought.model.ContentBundle',

	statics: {
		shouldShow: function() {
			var ContentStore = NextThought.app.library.content.StateStore.getInstance(),
				PurchaseStore = NextThought.app.store.StateStore.getInstance();

			return Promise.all([
					ContentStore.onceLoaded(),
					PurchaseStore.onceLoaded()
				]).then(function() {
					var bundles = ContentStore.getContentBundles() || [],
						packages = ContentStore.getContentPackages() || [],
						hasAvailablePurchases = PurchaseStore.getPurchasables().length > 0;

					return bundles.length || packages.length || hasAvailablePurchases;
				});
		}
	},

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
		this.PurchaseStore = NextThought.app.store.StateStore.getInstance();

		if (this.PurchaseStore.getPurchasables().length) {
			this.showAdd();
		} else {
			this.hideAdd();
		}

		this.ContentStore.onceLoaded()
			.then(this.showCurrentItems.bind(this));

		//TODO: add a listener to update when a bundle is added to the library
	},


	showCurrentItems: function() {
		var bundles = this.ContentStore.getContentBundles(),
			packages = this.ContentStore.getContentPackages();

		this.showItems(bundles.concat(packages));
	},


	showItems: function(current) {
		var store = new Ext.data.Store({
				model: this.storeModel,
				data: current,
				sorters: [{property: 'title', direction: 'DSC'}]
			});

		if (this.collection) {
			this.remove(this.collection);
		}

		this.collection = this.add({
			xtype: 'library-collection',
			store: store
		});
	}
});
