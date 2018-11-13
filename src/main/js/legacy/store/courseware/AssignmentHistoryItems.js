const Ext = require('@nti/extjs');

require('./GradeBookSummaries');


module.exports = exports = Ext.define('NextThought.store.courseware.AssignmentHistoryItems', {
	extend: 'NextThought.store.courseware.GradeBookSummaries',

	getAssignment: function () {
		return this.assignment;
	},

	getHistoryItem: function (historyItem, assignment, userId) {
		if(historyItem) {
			return this.HistoryItemCache.getRecord(historyItem);
		}
		else {
			return this.assignments.createPlaceholderHistoryItem(assignment, userId);
		}
	}
});
