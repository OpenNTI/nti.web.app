Ext.define('NextThought.app.course.assessment.components.admin.performance.View', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-admin-performance',

	renderTpl: Ext.DomHelper.markup({
		html: 'Admin Performance'
	}),


	setAssignmentsData: function() {
		return Promise.resolve();
	}
});
