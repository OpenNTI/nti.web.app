/*globals User*/
Ext.define('NextThought.store.courseware.AssignmentHistoryItems', {
	extend: 'NextThought.store.courseware.GradeBookSummaries',

	getAssignment: function() {
		return this.assignment;
	}
});
