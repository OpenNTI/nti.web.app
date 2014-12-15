Ext.define('NextThought.view.courseware.assessment.reader.Panel', {
	extend: 'NextThought.view.reader.Panel',
	alias: 'widget.course-assessment-reader',
	requires: [
		'NextThought.view.courseware.assessment.reader.Header',
		'NextThought.view.courseware.assessment.reader.TimedPlaceholder'
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


	getReaderConfig: function() {
		var assignment = this.assignment;

		if (assignment.isTimed && !assignment.isStarted() && isMe(this.student)) {
			this.hasTimedPlaceholder = true;
			return {xtype: 'courseware-assessment-timedplaceholder', assignment: assignment, startAssignment: this.startTimed.bind(this), flex: 1};
		} else {
			return this.callParent(arguments);
		}
	},


	startTimed: function() {
		this.fireEvent('removed-placeholder');
	},


	afterRender: function() {
		this.callParent(arguments);

		//if we are a placeholder then don't set the assignment items
		if (this.hasTimedPlaceholder) { return; }

		var r = this.down('reader-content'),
			container = this.up('[currentBundle]'),
			a = r.getAssessment(),
			assignment = this.assignment,
			savepoint = assignment && assignment.getSavePoint(),
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

		if (savepoint) {
			savepoint.then(function(point) {
				a.injectAssignmentSavePoint(point);
			});
		}

		a.setAssignmentFromStudentProspective(assignment, history);

		//if (assignment.get('availableEnding') >= now || !completed) {
			r.getNoteOverlay().disable();
		//}

		r.getContentMaskTarget().mask('Loading...', 'navigation');
		r.setLocation(this.location, done, true, container.currentBundle);
	}
});
