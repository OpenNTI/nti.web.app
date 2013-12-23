Ext.define('NextThought.view.courseware.assessment.admin.performance.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance',
	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Root'
	],

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	setAssignmentsData: function() {
		this.clearAssignmentsData();
		var root = this.add({ xtype: 'course-assessment-admin-performance-root', roster: this.roster });
		root.setAssignmentsData.apply(root, arguments);
	},

	clearAssignmentsData: function() {
		this.removeAll(true);
	}
});
