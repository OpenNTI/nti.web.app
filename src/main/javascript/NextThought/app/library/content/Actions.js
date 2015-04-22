Ext.define('NextThought.app.library.content.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.library.content.StateStore'
	],


	constructor: function() {
		this.callParent(arguments);

		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
	},

	
	loadContent: function(service) {
		var store = this.ContentStore;

		if (!service) {
			console.error('No Service document defined');
			return;
		}

		store.setLoading();

		return Promise.all([
			this.setUpContentPackages((service.getCollection('Main', 'Library') || {}).href),
			this.setUpContentBundles((service.getCollection('VisibleContentBundles', 'ContentBundles') || {}).href)
		]).always(function() {
			store.setLoaded();
		});
	},


	setUpContentPackages: function(link) {
		if (!link) {
			this.ContentStore.setContentPackages([]);

			return Promise.resolve();
		}

		return StoreUtils.loadItems(getURL(link), null, 'titles')
			.then(function(items) {
				//filter out packages that are courses
				return items.filter(function(item) {
					return !item.get('isCourse');
				});
			})
			.then(this.ContentStore.setContentPackages.bind(this.ContentStore));
	},


	setUpContentBundles: function(link) {
		if (!link) {
			this.ContentStore.setContentBundles([]);

			return Promise.resolve();
		}

		return StoreUtils.loadItems(getURL(link))
			.then(this.ContentStore.setContentBundles.bind(this.ContentStore));
	}
});
