const Ext = require('@nti/extjs');

const {isMe} = require('legacy/util/Globals');

require('../../navigation/assignment/Student');
require('../../components/assignment/TimedPlaceholder');
require('../../components/assignment/NotStartedPlaceholder');
require('../Reader');

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
			doNavigation: this.doNavigation.bind(this),
			handleEdit: this.handleEdit
		};
	},


	/**
	 * Get the toolbar and reader config with the correct assignment
	 *
	 * @return {[Array]} [toolbarConfig, readerConfig]
	 */
	getToolbarAndReaderConfig () {
		const assignment = this.assignment;
		const isPracticeSubmission = assignment && assignment.hasLink('PracticeSubmission');
		const baseToolbarConfig = this.getToolbarConfig();
		const baseReaderConfig = this.getReaderConfig();
		const defaultConfig = [baseToolbarConfig, baseReaderConfig];

		const getNewPageInfo = (newAssignment) => {
			if (this.pageInfo.regenerate) {
				return this.pageInfo.regenerate(newAssignment);
			}

			const newPageInfo = this.pageInfo.clone();

			newPageInfo.replaceAssignment(newAssignment);

			return Promise.resolve(newPageInfo);
		};


		//if the assignment hasn't started yet, and you can't do a practice submission
		if (!assignment || (!assignment.isAvailable() && !isPracticeSubmission)) {
			return [
				baseToolbarConfig,
				{
					xtype: 'assignment-notstarted-placeholder',
					assignment,
					flex: 1
				}
			];
		}

		//the assignment is a practice submission, or a no submit
		if (assignment.isNoSubmit() || (isMe(this.student) && isPracticeSubmission)) {
			if (!assignment.isTimed) {
				this.hasTimedPlaceholder = false;//BOOOOOO side effects
			}

			return [baseToolbarConfig, baseReaderConfig];
		}

		//the assignment is started, or submitted. Show the latest attempt
		if (assignment.isStarted() || assignment.hasSubmission()) {
			return assignment.getLatestAttempt()
				.then(attempt => attempt && attempt.getAssignment())
				.then((attemptAssignment) => {
					if (!attemptAssignment) { return defaultConfig; }

					if (!attemptAssignment.isTime) {
						this.hasTimedPlaceholder = false;
					}

					this.assignmentOverride = attemptAssignment;

					return getNewPageInfo(attemptAssignment)
						.then((pageInfo) => {
							return [
								{...baseToolbarConfig, assignment: attemptAssignment},
								{...baseReaderConfig, pageInfo}
							];
						});
				})
				.catch(() => defaultConfig);
		}

		//the assignment should not auto start
		if (!assignment.shouldAutoStart()) {
			this.hasTimedPlaceholder = true;

			return [
				baseToolbarConfig,
				{
					xtype: 'assignment-timedplaceholder',
					assignment: assignment,
					startAssignment: this.startTimed.bind(this),
					flex: 1
				}
			];
		}


		return assignment.start()
			.then((startedAssignment) => {
				if (!assignment.isTime) {
					this.hasTimedPlaceholder = false;
				}

				this.assignmentOverride = startedAssignment;

				return getNewPageInfo(startedAssignment)
					.then((pageInfo) => {
						return [
							{...baseToolbarConfig, assignment: startedAssignment},
							{...baseReaderConfig, pageInfo}
						];
					});
			})
			.catch(() => defaultConfig);
	},


	startTimed: function (assignment) {
		if (this.pageInfo) {
			this.pageInfo.replaceAssignment(assignment);
		}

		this.assignment = assignment;

		const regenerate = this.pageInfo.regenerate ? this.pageInfo.regenerate(assignment) : Promise.resolve(this.pageInfo);

		regenerate
			.then((pageInfo) => {
				this.pageInfo = pageInfo;
				this.showReader()
					.then(() => {
						delete this.hasTimedPlaceholder;

						if (this.rendered) {
							this.showAssignment();
						}
					});
			});

	},

	showAllowedTime: function () {
		var toolbar = this.getToolbar();

		if (toolbar && toolbar.showAllowedTime) {
			toolbar.showAllowedTime(this.assignment.getMaxTime());
		}
	},

	afterRender: function () {
		this.callParent(arguments);
		const me = this;

		this.maybeShowAllowedTime();
		this.assignment.on('refresh', () => {
			const regenerate = this.pageInfo && this.pageInfo.regenerate ? this.pageInfo.regenerate(this.assignment) : Promise.resolve(this.pageInfo);

			regenerate
				.then((pageInfo) => {
					this.pageInfo = pageInfo;

					this.showReader()
						.then(() => {
							this.showReader();
							this.maybeShowAllowedTime();
						});

				});
		});

		this.assignment.on('deleted', () => {
			me.showReader();
			me.bundle.getAssignments()
				.then((assignments) => {
					assignments.updateAssignments(true);
					this.handleNavigation('Assignments', '/', undefined, true);
				});
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
		const header = this.getToolbar();
		const reader = this.getReaderContent();

		if (!reader) {
			this.mon(this, 'reader-set', () => this.showAssignment(), this, {single: true});
			return;
		}

		var me = this,
			readerAssessment = reader && reader.getAssessment(),
			assignment = me.assignmentOverride || me.assignment,
			savepoint = assignment && assignment.getSavePoint(),
			assignmentHistory = assignment && assignment.hasHistoryLink() ? assignment.getHistory() : me.assignmentHistory;

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

		if (assignment.isTimed && this.assignment && this.assignment.hasLink('PracticeSubmission')) {
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

			return reader.setPageInfo(me.pageInfoOverride || me.pageInfo, me.bundle, me.fragment);
		}).always(done.bind(this));
	},

	updateHistory: function (h, container) {
		var header = this.getToolbar(),
			readerContent = this.getReaderContent(),
			assessment = readerContent.getAssessment();

		assessment.updateAssignmentHistoryItem(h);
		header.setHistory(h, container);
	},

	getAnalyticData: function () {
		if (!this.assignment) {
			return {};
		}

		var bundle = this.ContextStore.getRootBundle(),
			data = {
				type: 'AssignmentView',
				resourceId: this.assignment.getId(),
				ContentID: this.pageInfo.getId(),
				course: bundle && bundle.getId()
			};

		return data;
	}
});
