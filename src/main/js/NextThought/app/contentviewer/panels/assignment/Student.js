Ext.define('NextThought.app.contentviewer.panels.assignment.Student', {
	extend: 'NextThought.app.contentviewer.panels.Reader',
	alias: 'widget.assignment-reader',

	requires: [
		'NextThought.app.contentviewer.navigation.assignment.Student',
		'NextThought.app.contentviewer.components.assignment.TimedPlaceholder'
	],

	prefix: 'course-assignment',
	cls: 'reader-container assignment-reader',


	getToolbarConfig: function() {
		return {
			xtype: 'assignment-header',
			student: this.student,
			pageSource: this.pageSource,
			path: this.path,
			assignmentHistory: this.assignmentHistory,
			assignment: this.assignment,
			assignmentId: this.assignment.getId(),
			doNavigation: this.doNavigation.bind(this)
		};
	},


	getReaderConfig: function() {
		var assignment = this.assignment;

		if (assignment.isTimed && !assignment.isStarted() && isMe(this.student) && !this.instructorProspective) {
			this.hasTimedPlacholder = true;

			return {
				xtype: 'assignment-timedplaceholder',
				assignment: assignment,
				startAssignment: this.startTimed.bind(this),
				flex: 1
			};
		} else {
			return this.callParent(arguments);
		}
	},


	startTimed: function() {},


	showAllowedTime: function() {
		var toolbar = this.getToolbar();

		if (toolbar && toolbar.showAllowedTime) {
			toolbar.showAllowedTime(this.assignment.getMaxTime());
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.hasTimedPlaceholder) {
			this.showAllowedTime();
		} else {
			this.showAssignment();
		}
	},


	showAssignment: function() {
		var me = this,
			reader = me.getReaderContent(),
			readerAssessment = reader.getAssessment(),
			assignment = me.assignment,
			savepoint = assignment && assignment.getSavePoint(),
			assignmentHistory = me.assignmentHistory;

		reader.getScroll().lock();
		reader.hidePageWidgets();

		function done() {
			reader.getScroll().unlock();
		}

		if (!me.pageInfo) {
			console.error('No Page info');
			return;
		}

		if (!assignmentHistory || !(assignmentHistory instanceof Promise)) {
			assignmentHistory = Promise.resolve(assignmentHistory);
		}

		assignmentHistory.then(function(h) {
			readerAssessment.setAssignmentFromStudentProspective(assignment, h);
			readerAssessment.isInstructorProspective = me.instructorProspective;

			if (assignment.isTimed && this.instructorProspective) {
				me.showAllowedTime();
			}

			if (savepoint) {
				savepoint.then(function(point) {
					readerAssessment.injectAssignmentSavePoint(point);
				});
			}

			return reader.setPageInfo(me.pageInfo, me.bundle);
		}).then(done.bind(this));
	}
});
