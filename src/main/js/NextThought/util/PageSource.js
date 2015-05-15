Ext.define('NextThought.util.PageSource', {
	constructor: function(config) {
		this.callParent(arguments);

		this.currentIndex = config.currentIndex || 0;
		this.total = config.total || config.totalNodes || 0;
		this.next = config.next;
		this.previous = config.previous;
	},

	getPageNumber: function() {
		return this.currentIndex
	},


	getTotal: function() {
		return this.total;
	},


	hasNext: function() {
		return !!this.next;
	},


	hasPrevious: function() {
		return !!this.previous;
	},


	getNext: function() {
		return this.next;
	},


	getPrevious: function() {
		return this.previous;
	}
});
