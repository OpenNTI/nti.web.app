const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.util.PageSource', {

	mixins: {
		observable: 'Ext.util.Observable'
	},


	constructor: function (config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this);

		this.currentIndex = config.currentIndex || 0;
		this.total = config.total || config.totalNodes || 0;
		this.next = config.next;
		this.previous = config.previous;
		this.nextTitle = config.nextTitle;
		this.previousTitle = config.previousTitle;

		if (config.getRoute) {
			this.getRoute = config.getRoute;
		}
	},

	getPageNumber: function () {
		return this.currentIndex + 1;
	},


	getTotal: function () {
		return this.total;
	},


	hasNext: function () {
		return !!this.next;
	},


	hasPrevious: function () {
		return !!this.previous;
	},


	getNext: function () {
		return this.getRoute ? this.getRoute(this.next) : this.next;
	},


	getPrevious: function () {
		return this.getRoute ? this.getRoute(this.previous) : this.previous;
	},


	getNextTitle: function () {
		return this.nextTitle;
	},


	getPreviousTitle: function () {
		return this.previousTitle;
	},

	getNextPrecache: function () {
	},


	getPreviousPrecache: function () {
	}
});
