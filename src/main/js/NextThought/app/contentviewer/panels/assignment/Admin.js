Ext.define('NextThought.app.contentviewer.panels.assignment.Admin', {
	extend: 'NextThought.app.contentviewer.panels.Reader',
	alias: 'widget.admin-assignment-reader',

	requires: [
		'NextThought.app.contentviewer.navigation.assignment.Admin'
	],

	prefix: 'course-assignment-admin',

	getToolbarConfig: function() {
		return {
			xtype: 'course-assessment-admin-reader-header',
			parentView: this.parentView,
			student: this.student,
			path: this.path,
			pageSource: this.pageSource,
			assignment: this.assignment,
			assignmentHistory: this.assignmentHistory,
			doNavigation: this.doNavigation.bind(this)
		};
	},


	afterRender: function() {
		this.callParent(arguments);

		var reader = this.down('reader-content'),
			bundle = this.bundle,
			pageInfo = this.pageInfo,
			assignment = this.assignment,
			assignmentHistory = this.assignmentHistory,
			readerAssessment = reader.getAssessment();

		reader.getScroll().lock();
		reader.pageWidgets.hide();

		function done() {
			reader.getScroll().unlock();
		}

		if (!this.pageInfo) {
			console.error('No pageinfo configured');
			return;
		}

		if (!assignmentHistory || !(assignmentHistory instanceof Promise)) {
			assignmentHistory = Promise.resolve(this.assignmentHistory);
		}

		assignmentHistory.then(function(h) {
			readerAssessment.setAssignmentFromInstructorProspective(assignment, h);
			reader.getNoteOverlay().disable();

			return reader.setPageInfo(pageInfo, bundle);
		})
		.then(done.bind(this));
	}
});
