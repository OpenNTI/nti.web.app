Ext.define('NextThought.store.MockPage', {
	extend: 'Ext.data.Store',

	buffered: true,
	pageSize: 50, //default

	proxy: 'memory',
	purgePageCount: 0,
	remoteFilter: false,


	constructor: function() {
		this.callParent(arguments);
		if (!this.bind) {
			console.error('Cant create a mock page store without binding it');
			return;
		}

		this.mon(this.bind, {
			scope: this,
			datachanged: '__bindStore',
			load: '__bindStore'
		});

		//this.bind.promise.done(this.__bindStore.bind(this));

		this.__bindStore(this.bind);
	},


	__bindStore: function(store) {
		this.loadData(store.getRange());
	},


	getRange: function(start, end) {
		return this.data.getRange(start, end);
	},


	getTotalCount: function() {
		return this.data.getCount() || 0;
	},


	addFilter: function() {
		return this.bind.addFilter.apply(this.bind, arguments);
	},


	filter: function() {
		return this.bind.filter.apply(this.bind, arguments);
	},


	clearFilter: function() {
		return this.bind.clearFilter.apply(this.bind, arguments);
	},


	removeFilter: function() {
		return this.bind.removeFilter.apply(this.bind, arguments);
	},


	sort: function() {
		return this.bind.sort.apply(this.bind, arguments);
	}
});
