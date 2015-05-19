Ext.define('NextThought.app.course.assessment.components.student.Activity', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-activity',

	renderTpl: Ext.DomHelper.markup({
		html: 'Student Activity'
	}),


	setAssignmentsData: function() {
		return Promise.resolve();
	}
});