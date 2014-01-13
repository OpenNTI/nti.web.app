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


	showAssignment: function(assignment, user) {
		var id = assignment && ((assignment.getId && assignment.getId()) || assignment),
			x = this.store.getById(id),
			view = this.up('course-assessment-admin-assignments'),
			assignmentView, gridView,
			tab = this.up('[isTabView]').getEl();

		this.onItemClicked(null, x);

		assignmentView = view && view.down('course-assessment-admin-assignments-item');

		if (assignmentView) {
			gridView = assignmentView.down('grid dataview').loadMask;
			gridView.disable(true);

			if (user && tab && tab.dom) {
				//tab.mask('Loading...', 'navigation');
				tab.mask('Loading...');
			}

			assignmentView.filledStorePromise
				.done(function(store) {
					var recs = store.snapshot || store.data;
					try {
						recs.each(function(rec) {

							var creator = rec.get('Creator'),
									u = Ext.isString(user) ? user : user.getId();

							creator = Ext.isString(creator) ? creator : creator.getId();

							if (u === creator) {
								assignmentView.goToAssignment(null, rec);
							}

						});
					} finally {
						gridView.enable();
						tab.unmask();
					}
				})
				.fail(function(reason) {
					gridView.enable();
					tab.unmask();
					console.error(reason);
				});
		}
	}
});
