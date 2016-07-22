const Ext = require('extjs');
const {isMe} = require('legacy/util/Globals');

require('../Reader');
require('../../navigation/assignment/Student');
require('../../components/assignment/TimedPlaceholder');
require('../../components/assignment/NotStartedPlaceholder');


module.exports = exports = Ext.define('NextThought.app.contentviewer.panels.assignment.Student', {
	extend: 'NextThought.app.contentviewer.panels.Reader',
	alias: 'widget.assignment-reader',
	prefix: 'course-assignment',
	cls: 'reader-container assignment-reader',

	getToolbarConfig: function () {
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

	getReaderConfig: function () {
		var assignment = this.assignment;

		if (assignment.isTimed && !assignment.isStarted() && isMe(this.student) && !this.instructorProspective) {
			this.hasTimedPlaceholder = true;

			return {
				xtype: 'assignment-timedplaceholder',
				assignment: assignment,
				startAssignment: this.startTimed.bind(this),
				flex: 1
			};
		} else if (!assignment.isAvailable() && !this.instructorProspective) {
			return {
				xtype: 'assignment-notstarted-placeholder',
				assignment: assignment,
				flex: 1
			};
		} else {
			return this.callParent(arguments);
		}
	},

	startTimed: function (assignment) {
		if (this.pageInfo) {
			this.pageInfo.replaceAssignment(assignment);
		}

		if (this.pageInfo.regenerate) {
			this.pageInfo = this.pageInfo.regenerate();
		}

		this.assignment = assignment;
		this.showReader();

		if (!this.rendered) {
			delete this.hasTimedPlaceholder;
		} else {
			this.showAssignment();
		}
	},

	showAllowedTime: function () {
		var toolbar = this.getToolbar();

		if (toolbar && toolbar.showAllowedTime) {
			toolbar.showAllowedTime(this.assignment.getMaxTime());
		}
	},

	afterRender: function () {
		this.callParent(arguments);

		this.maybeShowAllowedTime();
		this.assignment.on('refresh', () => {
			if (this.pageInfo && this.pageInfo.regenerate) {
				this.pageInfo = this.pageInfo.regenerate();
			}
			this.showReader();
			this.maybeShowAllowedTime();
		});
	},

	maybeShowAllowedTime () {
		if (this.hasTimedPlaceholder) {
			this.showAllowedTime();
		} else {
			this.showAssignment();
		}
	},

	//Override this so the reader doesn't set the page info twice
	setPageInfo: function () {},

	showAssignment: function () {
		var me = this,
			header = me.getToolbar(),
			reader = me.getReaderContent(),
			readerAssessment = reader && reader.getAssessment(),
			assignment = me.assignment,
			savepoint = assignment && assignment.getSavePoint(),
			assignmentHistory = assignment && assignment.hasHistoryLink() ? assignment.getHistory() : me.assignmentHistory;

		if (!reader) {
			return;
		}


		reader.getScroll().lock();
		reader.hidePageWidgets();

		function done () {
			reader.getScroll().unlock();
			me.beginViewedAnalytics();
		}

		if (!me.pageInfo) {
			console.error('No Page info');
			return;
		}

		readerAssessment.isInstructorProspective = me.instructorProspective;

		if (assignment.isTimed && this.instructorProspective) {
			me.showAllowedTime();
		}

		if (!assignmentHistory || !(assignmentHistory instanceof Promise)) {
			assignmentHistory = Promise.resolve(assignmentHistory);
		}

		assignmentHistory.then(function (h) {
			return h;
		}).catch(function () {
			return null;
		}).then(function (h) {
			readerAssessment.setAssignmentFromStudentProspective(assignment, h);
			header.setHistory(h);

			if (savepoint) {
				savepoint.then(function (point) {
					/**
					 * NOTE: Only apply a savepoint if it's version is the same as the assignment version.
					 * Otherwise, just don't apply it. In the future, we might come up with a smarter way to apply
					 * the savepoint if it affects areas that haven't changed.
					 */
					let submission = point && point.get('Submission'),
						savePointVersion = submission && submission.get('version');

					if (savePointVersion === assignment.get('version')) {
						readerAssessment.injectAssignmentSavePoint(point);
					}
				});
			}

			reader.getNoteOverlay().disable();

			return reader.setPageInfo(me.pageInfo, me.bundle, me.fragment);
		}).always(done.bind(this));
	},

	updateHistory: function (h) {
		var header = this.getToolbar(),
			readerContent = this.getReaderContent(),
			assessment = readerContent.getAssessment();

		assessment.updateAssignmentHistoryItem(h);
		header.setHistory(h);
	},

	getAnalyticData: function () {
		if (!this.assignment) {
			return {};
		}

		var bundle = this.ContextStore.getRootBundle(),
			data = {
				type: 'assignment-viewed',
				'resource_id': this.assignment.getId(),
				ContentId: this.pageInfo.getId(),
				course: bundle && bundle.getId()
			};

		return data;
	}
});
