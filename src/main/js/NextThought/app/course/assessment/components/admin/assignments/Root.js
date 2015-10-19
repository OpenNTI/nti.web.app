Ext.define('NextThought.app.course.assessment.components.admin.assignments.Root', {
	extend: 'NextThought.app.course.assessment.components.student.assignments.View',
	alias: 'widget.course-assessment-admin-assignments-root',

	cls: 'assignment-list admin',

	requires: [
		'NextThought.app.course.assessment.components.admin.assignments.List',
		'NextThought.common.ux.Grouping'
	],


	newAssignmentList: function(grouper) {
		return {xtype: 'course-assessment-assignment-admin-list', store: grouper.store };
	},


	onItemClicked: function(view, rec) {
		if (!rec) {
			console.error('Ignoring click because no record was passed', arguments);
			return;
		}

		//This is the admin view... we will let the instructors view them no matter what. (so we will ignore the closed state)
		this.goToRecord(rec);
	},


	applyPagerFilter: function() {
		this.store.filter({
			id: 'open',
			filterFn: function(rec) {
				return rec.get('total') > 0;
			}
		});
	},


	goToRecord: function(rec) {
		var assignment = rec.get('item');

		if (assignment) {
			this.showStudentsForAssignment(assignment);
		}
	}
});
