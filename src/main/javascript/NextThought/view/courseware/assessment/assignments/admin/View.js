Ext.define('NextThought.view.courseware.assessment.assignments.admin.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments',
	requires: [
		'NextThought.view.courseware.assessment.assignments.admin.Root',
		'NextThought.view.courseware.assessment.assignments.admin.Assignment'
	],

	layout: 'card',

	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	setAssignmentsData: function() {
		this.clearAssignmentsData();
		var root = this.add({ xtype: 'course-assessment-admin-assignments-root' });
		root.setAssignmentsData.apply(root, arguments);
	},

	clearAssignmentsData: function() {
		this.removeAll(true);
	}
});
