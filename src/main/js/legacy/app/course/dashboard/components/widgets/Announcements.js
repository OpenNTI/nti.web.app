const Ext = require('extjs');

const Base = require('./Base');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.widgets.Announcements', {
	extend: 'NextThought.app.course.dashboard.components.widgets.Base',

	statics: {

		__BASE_WEIGHT: 3,

		__queryParams: {
			sortOn: 'CreatedTime',
			sortOrder: 'descending'
		},


		getWeight: function (record) {
			var time = Base.getTimeWeight(record.get('Last Modified'));

			return this.__BASE_WEIGHT + time;
		},


		getTiles: function (course, startDate, endDate) {
			return Promise.resolve([]);
		}
	}
});
