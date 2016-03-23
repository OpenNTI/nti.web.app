var Ext = require('extjs');
var ComponentsCurrent = require('../components/Current');
var ContentStateStore = require('./StateStore');
var StoreStateStore = require('../../store/StateStore');
var ComponentsCollection = require('../components/Collection');


module.exports = exports = Ext.define('NextThought.app.library.content.Current', {
	extend: 'NextThought.app.library.components.Current',
	alias: 'widget.library-current-content',
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

					return bundles.length || packages.length;//TODO: add || hasAvailablePurchases back once we have the UI
				});
		}
	},

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
		this.PurchaseStore = NextThought.app.store.StateStore.getInstance();

		//for now force the books to not have an add button
		if (this.PurchaseStore.getPurchasables().length && false) {
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
		if (this.store) {
			this.store.loadRecords(current);
		} else {
			this.store = new Ext.data.Store({
				model: this.storeModel,
				data: current,
				sorters: [{property: 'title', direction: 'DSC'}]
			});
		}

		if (this.collection) {
			this.remove(this.collection, true);
		}

		this.collection = this.add({
			xtype: 'library-collection',
			store: this.store,
			navigate: this.navigate.bind(this)
		});
	},

	onSeeAllClick: function() {
		if (this.pushRoute) {
			this.pushRoute('Books', '/books');
		}
	},

	navigate: function(bundle, el) {
		if (this.navigateToBundle) {
			this.navigateToBundle(bundle, el);
		}
	}
});
