Ext.define('NextThought.view.courseware.assessment.admin.performance.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance',
	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Root'
	],

	layout: 'stack',

	setAssignmentsData: function() {
		this.clearAssignmentsData();
		var root = this.pushView({ xtype: 'course-assessment-admin-performance-root' });
		root.setAssignmentsData.apply(root, arguments);
	},

	clearAssignmentsData: function() {
		this.removeAll(true);
	}
});
