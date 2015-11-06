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
				return JSON.parse(response);
			})
			.then(function(json) {
				me.setCollection(json);
			})
			.fail(function(reason) {
				console.error('Failed to load outline contents: ', reason);
				//TODO: Show an error state
			});
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
