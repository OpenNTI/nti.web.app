Ext.define('NextThought.app.course.assessment.components.student.assignments.View', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-assignments',

	renderTpl: Ext.DomHelper.markup({
		html: 'Student Assignments'
	}),


	setAssignmentsData: function() {
		return Promise.resolve();
	}
});