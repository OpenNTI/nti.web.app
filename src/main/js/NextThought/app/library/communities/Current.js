Ext.define('NextThought.app.library.communities.Current', {
	extend: 'NextThought.app.library.components.Current',
	alias: 'widget.library-current-communities',

	requires: ['NextThought.app.library.communities.components.Collection'],

	layout: 'none',
	title: 'Communities',

	storeModel: 'NextThought.model.Community',

	statics: {
		shouldShow: function() {
			return Service.getCommunitiesList()
				.then(function(communities) {
					return communities.length;
				});
		}
	},

	items: [],


	initComponent: function() {
		this.callParent(arguments);

		var siteCommunity = Service.get('SiteCommunity');

		this.sorterFn = function(a, b) {
			var aVal = a.getName(),
				bVal = b.getName();

			if (a.getId() === siteCommunity) {
				return -1;
			} else if (b.getId() === siteCommunity) {
				return 1;
			} else {
				return aVal < bVal ? -1 : aVal === bVal ? 0 : 1;
			}
		};

		Service.getCommunitiesList()
			.then(this.showCurrentItems.bind(this));
	},


	showCurrentItems: function(communities) {
		if (communities.length > 8) {
			this.showSeeAll();
		} else {
			this.hideSeeAll();
		}

		communities.sort(this.sorterFn);

		this.showItems(communities.slice(0, 8));
	},


	showItems: function(items) {
		var siteCommunity = Service.get('SiteCommunity');

		if (this.store) {
			this.store.loadRecords(items);
		} else {
			this.store = new Ext.data.Store({
				model: this.storeModel,
				data: items,
				sorters: [{
					sorterFn: this.sorterFn
				}]
			});
		}

		if (this.collection) {
			this.remove(this.collection, true);
		}

		this.collection = this.add({
			xtype: 'library-communities-collection',
			store: this.store,
			navigate: this.navigate.bind(this)
		});
	},


	onSeeAllClick: function() {
		if (this.pushRoute) {
			this.pushRoute('Communities', '/communities');
		}
	},


	navigate: function(community, el) {
		if (this.navigateToCommunity) {
			this.navigateToCommunity(community, el);
		}
	}
});
