const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');
const { isMe } = require('internal/legacy/util/Globals');

require('../../navigation/assignment/Student');
require('../../components/assignment/TimedPlaceholder');
require('../../components/assignment/NotStartedPlaceholder');
require('../../components/assignment/SubmittedMaskPlaceholder');
require('../Reader');

const t = scoped('nti-web-app.contentviewer.panels.assignment.Student', {
	alreadyStarted: {
		title: 'Attempt in Progress',
		msg: 'There is an ongoing attempt in progress. Clicking OK will continue that attempt.',
		button: 'OK',
	},
});

module.exports = exports = Ext.define(
	'NextThought.app.contentviewer.panels.assignment.Student',
	{
		extend: 'NextThought.app.contentviewer.panels.Reader',
		alias: 'widget.assignment-reader',
		prefix: 'course-assignment',
		cls: 'reader-container assignment-reader',

		getToolbarConfig: function (newAttempt) {
			return {
				xtype: 'assignment-header',
				student: this.student,
				pageSource: this.pageSource,
				path: this.path,
				assignmentHistory: newAttempt ? null : this.assignmentHistory,
				assignment: this.assignment,
				assignmentId: this.assignment.getId(),
				doNavigation: this.doNavigation.bind(this),
				handleEdit: this.handleEdit,
				onTryAgain: this.onTryAgain.bind(this),
			};
		},

		/**
		 * Get the toolbar and reader config with the correct assignment
		 *
		 * @param {boolean} newAttempt load the previous attempt or start a new one
		 * @returns {[Array]} [toolbarConfig, readerConfig]
		 */
		getToolbarAndReaderConfig(newAttempt) {
			const assignment = this.assignment;
			const isPracticeSubmission =
				assignment && assignment.hasLink('PracticeSubmission');
			const baseToolbarConfig = this.getToolbarConfig(newAttempt);
			const baseReaderConfig = this.getReaderConfig();
			const defaultConfig = [baseToolbarConfig, baseReaderConfig];

			const getNewPageInfo = newAssignment => {
				if (this.pageInfo.regenerate) {
					return this.pageInfo.regenerate(newAssignment);
				}

				const newPageInfo = this.pageInfo.clone();

				newPageInfo.replaceAssignment(newAssignment);

				return Promise.resolve(newPageInfo);
			};

			//if the assignment hasn't started yet, and you can't do a practice submission
			if (
				!assignment ||
				(!assignment.isAvailable() && !isPracticeSubmission)
			) {
				return [
					baseToolbarConfig,
					{
						xtype: 'assignment-notstarted-placeholder',
						assignment,
						flex: 1,
					},
				];
			}

			//the assignment is a practice submission, or a no submit
			if (
				assignment.isNoSubmit() ||
				(isMe(this.student) && isPracticeSubmission)
			) {
				if (!assignment.isTimed) {
					this.hasTimedPlaceholder = false; //BOOOOOO side effects
				}

				return [baseToolbarConfig, baseReaderConfig];
			}

			//the assignment is started, or submitted. Show the latest attempt
			if (
				!newAttempt &&
				(assignment.isStarted() || assignment.hasSubmission())
			) {
				return assignment
					.getLatestAttempt()
					.then(attempt => {
						return attempt && attempt.getAssignment();
					})
					.then(attemptAssignment => {
						if (!attemptAssignment) {
							return defaultConfig;
						}

						if (!attemptAssignment.isTime) {
							this.hasTimedPlaceholder = false;
						}

						if (
							assignment.hasSubmission() &&
							attemptAssignment.get('HideAfterSubmission')
						) {
							return [
								baseToolbarConfig,
								{
									xtype: 'assignment-submitted-masked-placeholder',
									assignment,
									flex: 1,
									isMaskedAssignment: true,
								},
							];
						}

						this.assignmentOverride = attemptAssignment;

						return getNewPageInfo(attemptAssignment).then(
							pageInfo => {
								return [
									{
										...baseToolbarConfig,
										assignment: attemptAssignment,
									},
									{ ...baseReaderConfig, pageInfo },
								];
							}
						);
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
						assignment: this.assignmentOverride || assignment,
						startAssignment: this.startTimed.bind(this),
						startFailed: this.startFailed.bind(this),
						flex: 1,
					},
				];
			}

			return assignment
				.start()
				.then(startedAssignment => {
					if (!assignment.isTime) {
						this.hasTimedPlaceholder = false;
					}

					this.assignmentOverride = startedAssignment;

					return getNewPageInfo(startedAssignment).then(pageInfo => {
						return [
							{
								...baseToolbarConfig,
								assignment: startedAssignment,
							},
							{ ...baseReaderConfig, pageInfo },
						];
					});
				})
				.catch(() => defaultConfig);
		},

		getTimedPlaceholder() {
			return this.down('assignment-timedplaceholder');
		},

		doStartAssignment() {
			const assignment = this.assignmentOverride || this.assignment;

			return assignment
				.start()
				.then(started => this.startTimed(started))
				.catch(err => this.startFailed(err));
		},

		startFailed(error) {
			if (error.status !== 422) {
				return;
			}

			const assignment = this.assignmentOverride || this.assignment;
			let refresh = assignment.updateFromServer();

			Ext.MessageBox.alert({
				title: t('alreadyStarted.title'),
				msg: t('alreadyStarted.msg'),
				icon: 'warning-red',
				buttonText: true,
				buttons: {
					primary: {
						name: 'yes',
						text: t('alreadyStarted.button'),
					},
				},
				fn: button => {
					if (button === 'yes') {
						refresh.then(started => this.startTimed(started));
					}
				},
			});
		},

		startTimed: function (assignment) {
			if (this.pageInfo) {
				this.pageInfo.replaceAssignment(assignment);
			}

			this.assignment = assignment;

			const regenerate = this.pageInfo.regenerate
				? this.pageInfo.regenerate(assignment)
				: Promise.resolve(this.pageInfo);

			return regenerate.then(pageInfo => {
				this.pageInfo = pageInfo;
				this.showReader().then(() => {
					delete this.hasTimedPlaceholder;

					if (this.rendered) {
						this.showAssignment();
					}
				});
			});
		},

		async onTryAgain() {
			const config = await this.getToolbarAndReaderConfig(true);

			await this.applyReaderConfigs(config);

			if (this.rendered) {
				if (this.getReaderContent()) {
					this.showAssignment({ noHistory: true });
				} else if (this.getTimedPlaceholder()) {
					this.updateActiveAssignment();
				}
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
		},

		maybeShowAllowedTime() {
			if (this.hasTimedPlaceholder) {
				this.showAllowedTime();
				this.updateActiveAssignment();
			} else {
				this.showAssignment();
			}
		},

		//Override this so the reader doesn't set the page info twice
		setPageInfo: function () {},

		getAssignmentHistory(config) {
			if ((config && config.noHistory) || this.instructorProspective) {
				return Promise.resolve(null);
			}

			if (config?.historyItem) {
				return Promise.resolve(config.historyItem);
			}

			return this.assignment
				.getLatestAttempt()
				.then(attempt => {
					if (attempt) {
						return attempt.getHistoryItem();
					}

					return this.assignment.getHistory();
				})
				.catch(() => this.assignmentHistory);
		},

		updateActiveAssignment() {
			if (this.setActiveHistoryItem) {
				this.setActiveHistoryItem(
					null,
					null,
					this.assignmentOverride || this.assignment
				);
			}
		},

		updateAssignment(override) {
			const regenerate =
				this.pageInfo && this.pageInfo.regenerate
					? this.pageInfo.regenerate(override)
					: Promise.resolve(this.pageInfo);

			return regenerate
				.then(pageInfo => {
					this.pageInfo = pageInfo;

					return this.showReader()
						.then(() => this.showReader())
						.then(() => this.maybeShowAllowedTime());
				})
				.catch(() => {}); //swallow any errors
		},

		monitorAssignment(assignment) {
			Ext.destroy(this.assignmentMonitors);

			this.assignmentMonitors = assignment.on({
				destroyable: true,
				refresh: this.updateAssignment,
				deleted: () => {
					this.bundle.getAssignments().then(assignments => {
						assignments.updateAssignments(true);

						const newAssignment = assignments.findItem(
							assignment.getId()
						);

						if (!newAssignment) {
							this.handleNavigtion('', '/', undefined, true);
						} else {
							assignment.syncWith(newAssignment);
						}
					});
				},
			});
		},

		async addClassesForAssignment(assignmentModel) {
			const assignment = await assignmentModel.getInterfaceInstance();

			if (!this.rendered) {
				return;
			}

			if (
				assignment.isOutsideSubmissionBuffer() &&
				!assignment.hasLink('PracticeSubmission')
			) {
				this.addCls('out-side-submission-buffer');
			} else {
				this.removeCls('out-side-submission-buffer');
			}
		},

		showAssignment: function (config) {
			const header = this.getToolbar();
			const reader = this.getReaderContent();
			const mask = this.down('[isMaskedAssignment]');

			if (mask) {
				this.showMaskedAssignment(config);
				return;
			}

			if (!reader) {
				this.mon(
					this,
					'reader-set',
					() => this.showAssignment(config),
					this,
					{ single: true }
				);
				return;
			}

			var me = this,
				readerAssessment = reader && reader.getAssessment(),
				assignment = me.assignmentOverride || me.assignment,
				savepoint = assignment && assignment.getSavePoint();

			reader.getScroll().lock();
			reader.hidePageWidgets();

			function maybeSetActiveHistoryItem(h, container) {
				if (me.setActiveHistoryItem) {
					me.setActiveHistoryItem(h, container, assignment);
				}
			}

			function done() {
				reader.getScroll().unlock();
				me.beginViewedAnalytics();
			}

			if (!me.pageInfo) {
				console.error('No Page info');
				return;
			}

			readerAssessment.isInstructorProspective = me.instructorProspective;

			if (
				assignment.isTimed &&
				this.assignment &&
				this.assignment.hasLink('PracticeSubmission')
			) {
				me.showAllowedTime();
			}

			return this.getAssignmentHistory(config)
				.then(function (h) {
					if (!h) {
						maybeSetActiveHistoryItem(null, null);
						return [null, null];
					}

					return h
						.resolveFullContainer()
						.then(container => [h, container]);
				})
				.catch(function (e) {
					return [null, null];
				})
				.then(function ([h, container]) {
					maybeSetActiveHistoryItem(h, container);

					readerAssessment.setAssignmentFromStudentProspective(
						assignment,
						h
					);
					header.setHistory(h, container);

					me.monitorAssignment(assignment);
					me.addClassesForAssignment(assignment);

					if (savepoint) {
						savepoint.then(function (point) {
							/**
							 * NOTE: Only apply a savepoint if its version is the same as the assignment version.
							 * Otherwise, just don't apply it. In the future, we might come up with a smarter way to apply
							 * the savepoint if it affects areas that haven't changed.
							 */
							let submission = point && point.get('Submission'),
								savePointVersion =
									submission && submission.get('version');

							if (
								savePointVersion === assignment.get('version')
							) {
								readerAssessment.injectAssignmentSavePoint(
									point
								);
							}
						});
					}

					reader.getNoteOverlay().disable();

					return reader.setPageInfo(
						me.pageInfoOverride || me.pageInfo,
						me.bundle,
						me.fragment
					);
				})
				.always(done.bind(this));
		},

		showMaskedAssignment(config) {
			const header = this.getToolbar();
			const assignment = this.assignmentOverride || this.assignment;
			const maybeSetActiveHistoryItem = (h, container) => {
				if (this.setActiveHistoryItem) {
					this.setActiveHistoryItem(h, container, assignment);
				}
			};

			this.getAssignmentHistory(config)
				.then(h => {
					if (!h) {
						maybeSetActiveHistoryItem(null, null);
						return [null, null];
					}

					return h
						.resolveFullContainer()
						.then(container => [h, container]);
				})
				.catch(e => [null, null])
				.then(([h, container]) => {
					maybeSetActiveHistoryItem(h, container);
					header.setHistory(h, container);

					this.monitorAssignment(assignment);
					this.addClassesForAssignment(assignment);
				})
				.always(() => this.beginViewedAnalytics());
		},

		updateHistory: function (h, container) {
			var header = this.getToolbar(),
				readerContent = this.getReaderContent(),
				assessment = readerContent.getAssessment();

			const attempt = h.get('MetadataAttemptItem');

			attempt.getAssignment().then(assignment => {
				this.assignmentOverride = assignment;

				if (this.setActiveHistoryItem) {
					this.setActiveHistoryItem(h, container, assignment);
				}
				if (assignment.get('HideAfterSubmission')) {
					this.applyReaderConfigs([
						this.getToolbarConfig(),
						{
							xtype: 'assignment-submitted-masked-placeholder',
							assignment,
							flex: 1,
							isMaskedAssignment: true,
						},
					]);

					this.showMaskedAssignment({ historyItem: h });
				} else {
					assessment.updateAssignmentHistoryItem(h);
					header.setHistory(h, container);
				}
			});
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
					course: bundle && bundle.getId(),
				};

			return data;
		},
	}
);
