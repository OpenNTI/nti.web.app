Ext.define('NextThought.view.courseware.assessment.assignments.admin.Root', {
	extend: 'NextThought.view.courseware.assessment.assignments.View',
	alias: 'widget.course-assessment-admin-assignments-root',
	requires: [
		'NextThought.view.courseware.assessment.assignments.admin.List'
	],

	newAssignmentList: function(grouper) {
		return { xtype: 'course-assessment-assignment-admin-list', store: grouper.store };
	},


	onItemClicked: function(view, rec) {
		if (!rec) {
			console.error('Ignoring click because no record was passed.', arguments);
			return;
		}
		//This is the admin view... we will let instructors view them no matter what. (so we will ignore the closed state)
		this.fireEvent('assignment-clicked', rec);
	},


	applyPagerFilter: function() {
		//admins can see all assignments at any time.
		this.store.filter({
			id: 'open',
			filterFn: function(rec) {
				return rec.get('total') > 0; //ensure there are submit parts (if no submit parts, its not to be subbmitted in the platform)
			}
		});
	},


	showAssignment: function(assignment, user) {
		var id = assignment && ((assignment.getId && assignment.getId()) || assignment),
			x = this.store.getById(id),
			item = x && x.get('item'),
			parts = (item && item.get('parts')) || [];
			//tab = this.up('[isTabView]').getEl(),
			//view, assignmentView;

		this.onItemClicked(null, x);


		if (parts.length === 0) {
			console.warn('Cannot show an assignment that does not have submit parts.');
			return;
		}

		//view = this.up('course-assessment-admin-assignments');
		//assignmentView = view && view.down('course-assessment-admin-assignments-item');
		//if (assignmentView) {
			//assignmentView.goToAssignment(null, rec);
		//}

		return null;
	}
});
