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
		var bind = this.bind;
		this.mon(bind, {
			scope: this,
			datachanged: '__bindStore',
			load: '__bindStore'
		});

		this.data.getByKey = function() {
			if (bind && bind.data && bind.data.getByKey) {
				return bind.data.getByKey.apply(bind.data, arguments);
			}
		};

		this.__bindStore(bind);
	},


	__bindStore: function(store) {
		this.loadData(store.getRange());
	},


	getRange: function(start, end) {
		var max = this.data.getCount() - 1;
		if (end === undefined) {
			end = max;
		}

		end = Math.min(max, end);
		return this.data.getRange(start || 0, end);
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
