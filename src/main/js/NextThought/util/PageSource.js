Ext.define('NextThought.util.PageSource', {

	mixins: {
		observable: 'Ext.util.Observable'
	},


	constructor: function(config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this);

		this.currentIndex = config.currentIndex || 0;
		this.total = config.total || config.totalNodes || 0;
		this.next = config.next;
		this.previous = config.previous;
		this.nextTitle = config.nextTitle;
		this.previousTitle = config.previousTitle;
	},

	getPageNumber: function() {
		return this.currentIndex;
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
	},


	getNextTitle: function() {
		return this.nextTitle;
	},


	getPreviousTitle: function() {
		return this.previousTitle;
	}
});
