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
		this.fireEvent('assignement-clicked', rec);
	},


	showAssignment: function(assignment, user) {
		var id = assignment && ((assignment.getId && assignment.getId()) || assignment),
			x = this.store.getById(id),
			view = this.up('course-assessment-admin-assignments'), assignment;
		
		this.onItemClicked(null, x);
		
		assignment = view && view.down('course-assessment-admin-assignments-item');

		if (assignment) {
			assignment.filledStorePromise
				.done(function(store){
					
					store.each(function(rec){
						var creator = rec.get('Creator'),
							u = Ext.isString(user)? user : user.getId();

						creator = Ext.isString(creator)? creator : creator.getId();

						if(u === creator){
							assignment.goToAssignment(null, rec);
						}
					});
				})
				.fail(function(reason){
					console.error(reason);
				});
		}
	}
});
