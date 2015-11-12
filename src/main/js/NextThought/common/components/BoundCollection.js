Ext.define('NextThought.common.components.BoundCollection', {
	extend: 'Ext.container.Container',

	layout: 'none',
	items: [],

	getBodyContainer: function() {
		return this;
	},


	loadCollection: function(url) {
		var me = this;

		me.activeUrl = url;

		return Service.request(url)
			.then(function(response) {
				var obj = ParseUtils.parseItems(response)[0];

				return obj || JSON.parse(response);
			})
			.then(function(json) {
				me.setCollection(json);
			})
			.fail(function(reason) {
				console.error('Failed to load outline contents: ', reason);
				//TODO: Show an error state
			});
	},


	getItems: function(collection) {
		return collection.get('Items');
	},


	setCollection: function(collection) {
		var me = this,
			body = me.getBodyContainer(),
			items = me.getItems(collection);

		items = items.map(function(item) {
			return me.getCmpForRecord(item);
		}).filter(function(item) { return !!item; });

		body.add(items);
	},


	getCmpForRecord: function(record) {

	},


	clearCollection: function() {
		var body = this.getBodyContainer();

		body.removeAll(true);
	},


	refresh: function() {
		this.clearCollection();

		return this.loadCollection(this.activeUrl);
	}
});
