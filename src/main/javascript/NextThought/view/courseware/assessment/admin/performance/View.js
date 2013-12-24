Ext.define('NextThought.view.courseware.assessment.admin.performance.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance',
	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Root',
		'NextThought.view.courseware.assessment.admin.performance.Student'
	],

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	setAssignmentsData: function() {
		this.clearAssignmentsData();
		var root = this.add({ xtype: 'course-assessment-admin-performance-root', roster: this.roster });
		root.setAssignmentsData.apply(root, arguments);

		this.assignmentsData = Ext.Array.clone(arguments);
		this.store = root.store;
		this.mon(root, 'student-clicked', 'showStudentFromClick');
	},

	clearAssignmentsData: function() {
		this.removeAll(true);
	},


	showRoot: function() {
		this.getLayout().setActiveItem(0);
		Ext.destroy(this.items.getRange(1));
	},


	showStudentFromClick: function(view, rec) {
		this.showStudent(rec);
	},


	showStudent: function(rec) {
		Ext.destroy(this.down('course-assessment-admin-performance-student'));

		var view = this.add({
			xtype: 'course-assessment-admin-performance-student',
			student: rec.get('user'),
			page: this.store.indexOf(rec) + 1,
			total: this.store.getCount(),
			roster: this.roster
		});

		view.setAssignmentsData.apply(view, this.assignmentsData);

		this.mon(view, {
			goto: 'showStudentAt',
			goup: 'showRoot'
		});
	},


	showStudentAt: function(index) {
		var rec = this.store.getAt(index);
		if (!rec) {
			console.error('No record at index: ' + index);
			return;
		}
		this.showStudent(rec);
	}
});
