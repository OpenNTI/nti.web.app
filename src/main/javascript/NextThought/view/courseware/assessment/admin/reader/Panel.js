Ext.define('NextThought.view.courseware.assessment.admin.reader.Panel', {
	extend: 'NextThought.view.reader.Panel',
	alias: 'widget.course-assessment-admin-reader',
	requires: [
		'NextThought.view.courseware.assessment.admin.reader.Header'
	],
	prefix: 'course-assignment-admin',

	mixins: {
		ParentViewInteractions: 'NextThought.view.courseware.assessment.reader.ParentViewInteractions'
	},


	constructor: function() {
		this.callParent(arguments);
		this.mixins.ParentViewInteractions.constructor.call(this);
	},


	getToolbarConfig: function() {
		return {
			xtype: 'course-assessment-admin-reader-header',
			parentView: this.parentView,
			student: this.student,
			page: this.page,
			path: this.path,
			store: this.store,
			total: this.store.getCount(),
			assignmentHistory: this.assignmentHistory
		};
	},


	afterRender: function() {
		this.callParent(arguments);
		var r = this.down('reader-content'),
			a = r.getAssessment();

		r.getScroll().lock();
		r.pageWidgets.hide();

		function done() {
			r.getScroll().unlock();
		}

		this.relayEvents(this.down('course-assessment-admin-reader-header'), ['goup']);
		if (!this.location) {
			console.error('No location configured');
		}
		r.getNoteOverlay().disable();
		a.setAssignmentFromInstructorProspective(this.assignment, this.assignmentHistory);
		r.setLocation(this.location, done, true);

	}
});
