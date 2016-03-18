var Ext = require('extjs');
var CoursewareGradeBookSummaries = require('./GradeBookSummaries');


/*globals User*/
module.exports = exports = Ext.define('NextThought.store.courseware.AssignmentHistoryItems', {
	extend: 'NextThought.store.courseware.GradeBookSummaries',

	getAssignment: function() {
		return this.assignment;
	}
});
