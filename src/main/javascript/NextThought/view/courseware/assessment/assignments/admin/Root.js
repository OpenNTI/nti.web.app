Ext.define('NextThought.view.courseware.assessment.assignments.admin.Root', {
	extend: 'NextThought.view.courseware.assessment.assignments.View',
	alias: 'widget.course-assessment-admin-assignments-root',
	requires: [
		'NextThought.view.courseware.assessment.assignments.admin.List'
	],

	newAssignmentList: function(grouper) {
		return { xtype: 'course-assessment-assignment-admin-list', store: grouper.store };
	},


	onItemClicked: function(view, rec) {
		this.fireEvent('assignement-clicked', rec);
	},


	showAssignment: function(assignment, user) {
		var id = assignment && ((assignment.getId && assignment.getId()) || assignment),
			x = this.store.getById(id);
		this.onItemClicked(null, x);
		//TODO: drill down and auto-select student
	}
});
