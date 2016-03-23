var Ext = require('extjs');
var AnalyticsUtil = require('../util/Analytics');
var ModelBase = require('./Base');


module.exports = exports = Ext.define('NextThought.model.BaseProgress', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'auto'}
	],


	getProgress: function(id) {
		var items = this.get('Items');

		return items[id];
	},


	hasBeenViewed: function(id) {
		var progress = this.getProgress(id),
			hasBeenViewed = AnalyticsUtil.hasBeenViewed(id);

		if (progress) {
			hasBeenViewed = hasBeenViewed || progress.AbsoluteProgress > 0;
		}

		return hasBeenViewed;
	}
});
