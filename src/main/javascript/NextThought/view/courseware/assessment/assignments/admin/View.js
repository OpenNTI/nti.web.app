Ext.define('NextThought.view.courseware.assessment.assignments.admin.View', {
	extend: 'NextThought.view.courseware.assessment.assignments.View',
	alias: 'widget.course-assessment-admin-assignments-root',
	requires: [
		'NextThought.view.courseware.assessment.assignments.admin.List'
	],


	newAssignmentList: function(grouper) {
		return { xtype: 'course-assessment-assignment-admin-list', store: grouper.store };
	}
});
