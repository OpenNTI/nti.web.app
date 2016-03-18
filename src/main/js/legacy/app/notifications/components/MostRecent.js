var Ext = require('extjs');
var ComponentsList = require('./List');


module.exports = exports = Ext.define('NextThought.app.notifications.components.MostRecent', {
	extend: 'NextThought.app.notifications.components.List',
	alias: 'widget.notifications-most-recent',

	SHOW_COUNT: 20,
	SHOW_GROUP_LABEL: false,

	cls: 'recent-notifications',


	navigateToItem: function(rec) {
		this.navigateToObject(rec);
	},


	//Be sure to not show dividers in the most recent
	insertDividers: function() {},


	setUpListeners: function(store) {
		this.mon(store.backingStore, {
			add: 'updateRecords',
			refresh: 'updateRecords'
		});

		this.updateRecords();
	},


	updateRecords: function() {
		var range = this.store.backingStore.getRange(),
			subRange = range.slice(0, this.SHOW_COUNT);

		this.store.loadRecords(subRange);
		this.storeLoaded(this.store);
		this.maybeNotify();
	}
});
