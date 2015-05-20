Ext.define('NextThought.app.course.assessment.components.admin.assignments.View', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-admin-assignments',

	renderTpl: Ext.DomHelper.markup({html: 'Admin Assignments'}),

	setAssignmentsData: function() {
		return Promise.resolve();
	}
});
