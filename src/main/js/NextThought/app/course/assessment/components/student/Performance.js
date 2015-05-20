Ext.define('NextThought.app.course.assessment.components.student.Performance', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-performance',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	renderTpl: Ext.DomHelper.markup({
		html: 'Student Performance'
	}),


	setAssignmentsData: function() {
		return Promise.resolve();
	}
});
