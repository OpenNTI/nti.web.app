Ext.define('NextThought.app.course.assessment.components.admin.performance.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.assessment.components.admin.performance.Root',
		'NextThought.app.course.assessment.components.admin.performance.Student',
		'NextThought.util.PageSource'
	],

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	clearAssignmentsData: function() {
		this.removeAll(true);
	},


	setAssignmentsData: function(assignments, bundle) {
		this.clearAssignmentsData();

		var root = this.add({
				xtype: 'course-assessment-admin-performance-root',
				showAssignmentsForStudent: this.showAssignmentsForStudent.bind(this),
				assignments: assignments,
				pushRouteState: this.pushRouteState.bind(this),
				replaceRouteState: this.replaceRouteState.bind(this)
			});

		this.assignmentsData = Ext.Array.clone(arguments);
		this.store = root.store;

		return root.restoreState(this.getRouteState());
	},


	showAssignmentsForStudent: function(student) {}
});
