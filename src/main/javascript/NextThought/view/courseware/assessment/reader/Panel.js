Ext.define('NextThought.view.courseware.assessment.reader.Panel', {
	extend: 'NextThought.view.reader.Panel',
	alias: 'widget.course-assessment-reader',
	requires: [
		'NextThought.view.courseware.assessment.reader.Header'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll',
		ParentViewInteractions: 'NextThought.view.courseware.assessment.reader.ParentViewInteractions'
	},

	prefix: 'course-assignment',
	cls: 'reader-container assignment-reader',

	scrollTargetSelector: '.assignment-reader .x-panel-body-reader',
	secondaryElSelector: '.assignment-reader .x-panel-notes-and-discussion',


	constructor: function() {
		this.callParent(arguments);
		this.mixins.ParentViewInteractions.constructor.call(this);
	},


	getToolbarConfig: function() {
		return {
			xtype: 'course-assessment-reader-header',
			parentView: this.parentView,
			student: this.student,
			pageSource: this.pageSource,
			path: this.path,
			assignmentHistory: this.assignmentHistory,
			assignment: this.assignment,
			assignmentId: this.assignment.getId()
		};
	},


	afterRender: function() {
		this.callParent(arguments);
		var r = this.down('reader-content'),
			a = r.getAssessment(),
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
