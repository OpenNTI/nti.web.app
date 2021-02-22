const Ext = require('@nti/extjs');

const AnalyticsUtil = require('legacy/util/Analytics');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.BaseProgress', {
	extend: 'NextThought.model.Base',

	fields: [{ name: 'Items', type: 'auto' }],

	getProgress: function (id) {
		var items = this.get('Items');

		return items[id];
	},

	hasBeenViewed: function (id) {
		var progress = this.getProgress(id),
			hasBeenViewed = AnalyticsUtil.hasBeenViewed(id);

		if (progress) {
			hasBeenViewed = hasBeenViewed || progress.AbsoluteProgress > 0;
		}

		return hasBeenViewed;
	},
});
