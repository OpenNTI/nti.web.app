const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.util.TabIndexTracker', {

	current: 1,


	getNext: function (skip) {
		var r = this.current;
		this.current += 1 + (skip || 0);
		return r;
	},

	reset: function (seed) {
		this.current = (seed || 0);
	}
}, function () {
	this.prototype.next = this.prototype.getNext;
});
