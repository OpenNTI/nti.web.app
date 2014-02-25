Ext.define('NextThought.util.PageSource', {

	isPageSource: true,

	mixins: {
		observable: 'Ext.util.Observable'
	},

	config: {
		store: null,
		current: 0
	},


	constructor: function(cfg) {
		this.mixins.observable.constructor.call(this);
		this.initConfig(cfg);

		if (this.store.isPageSource) {
			this.store = this.store.store;
		}
	},


	getTotal: function() {
		var s = this.store;
		return s.getTotalCount() || s.getCount();
	},


	getPageNumber: function() {
		//pages are a 1 based index, where our current position is a 0 based index.
		return this.getCurrentPosition() + 1;
	},


	getCurrentPosition: function() {
		return this.current;
	},


	getCurrent: function() {
		return this.store.getAt(this.current);
	},


	getNext: function() {
		var n = this.getCurrentPosition() + 1;
		if (n >= this.getTotal()) {
			n = 0;
		}
		this.current = n;
		return this.store.getAt(n);
	},


	getPrevious: function() {
		var n = this.getCurrentPosition() - 1;
		if (n < 0) {
			n = this.getTotal() - 1;
		}
		this.current = n;
		return this.store.getAt(n);
	},


	hasNext: function() { return this.store && this.getTotal() > 1; },


	hasPrevious: function() { return this.store && this.getTotal() > 1; }
});


