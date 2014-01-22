Ext.define('NextThought.view.courseware.assessment.reader.Panel', {
	extend: 'NextThought.view.reader.Panel',
	alias: 'widget.course-assessment-reader',
	requires: [
		'NextThought.view.courseware.assessment.reader.Header'
	],
	prefix: 'course-assignment',


	getToolbarConfig: function() {
		return {
			xtype: 'course-assessment-reader-header',
			parentView: this.parentView,
			student: this.student,
			page: this.page,
			path: this.path,
			store: this.store,
			total: this.store.getCount(),
			assignmentHistory: this.assignmentHistory,
			assignmentId: this.assignment.getId()
		};
	},


	afterRender: function() {
		this.callParent(arguments);
		var r = this.down('reader-content'),
			a = r.getAssessment(),
			now = new Date(),
			assignment = this.assignment,
			history = this.assignmentHistory,
			completed = history && history.get('completed');

		r.getScroll().lock();
		r.pageWidgets.hide();

		function done() {
			r.getScroll().unlock();
		}

		this.relayEvents(this.down('course-assessment-reader-header'), ['goup']);
		if (!this.location) {
			console.error('No location configured');
		}
		a.setAssignmentFromStudentProspective(assignment, history);

		//if (assignment.get('availableEnding') >= now || !completed) {
			r.getNoteOverlay().disable();
		//}

		r.setLocation(this.location, done, true);

	}
});
