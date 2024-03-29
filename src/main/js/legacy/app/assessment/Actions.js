const Ext = require('@nti/extjs');
const { Events } = require('@nti/web-session');
const { scoped } = require('@nti/lib-locale');
const AssessmentQuestionSetSubmission = require('internal/legacy/model/assessment/QuestionSetSubmission');
const AssessmentAssignmentSubmission = require('internal/legacy/model/assessment/AssignmentSubmission');
const AssessmentQuestionSubmission = require('internal/legacy/model/assessment/QuestionSubmission');
const AssessmentSurveySubmission = require('internal/legacy/model/assessment/SurveySubmission');
const AssessmentPollSubmission = require('internal/legacy/model/assessment/PollSubmission');

const ContextStateStore = require('../context/StateStore');

require('internal/legacy/common/Actions');
require('internal/legacy/model/assessment/UsersCourseInquiryItemResponse');

const t = scoped('nti-web-app.assessment.Actions', {
	assignments: {
		errors: {
			alreadySubmitted: {
				title: 'This assignment has already been submitted',
				msg: 'Clicking OK will reload the assignment and show the submission',
				button: 'OK',
			},
			pastDue: {
				title: 'This assignment is past due',
				msg: 'You can continue to view this assignment, but it cannot be submitted.',
				button: 'OK',
			},
			conflict: {
				title: 'This assignment has changed',
				msg: 'Clicking OK will reload the assignment.',
				button: 'OK',
			},
			unavailable: {
				title: 'This assignment is no longer available',
				msg: 'Clicking OK will exit the assignment.',
				button: 'OK',
			},
			deletion: {
				title: 'This assignment no longer exists',
				msg: 'Clicking OK will exit the assignment.',
				button: 'OK',
			},
			fileupload: {
				title: 'A file upload question has changed',
				msg: 'Clicking OK will reload the assignment.',
				button: 'OK',
			},
		},
	},
});

module.exports = exports = Ext.define('NextThought.app.assessment.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.ContextStore = ContextStateStore.getInstance();
	},

	__getDataForSubmission: function (
		questionSet,
		submissionData,
		containerId,
		startTime,
		questionCls,
		questionMime,
		questionId
	) {
		var key,
			value,
			qData,
			endTimeStamp = new Date().getTime(),
			//in seconds
			duration = (endTimeStamp - startTime) / 1000,
			data = {
				ContainerId: containerId,
				questionSetId: questionSet.getId(),
				questions: [],
				CreatorRecordedEffortDuration: duration,
			};

		for (key in submissionData) {
			if (submissionData.hasOwnProperty(key)) {
				value = submissionData[key];

				qData = {
					Class: questionCls,
					MimeType: questionMime,
					ContainerId: containerId,
					NTIID: key,
					parts: value,
				};

				qData[questionId] = key;

				data.questions.push(qData);
			}
		}

		return data;
	},

	__getDataForQuestionSubmission: function (
		questionSet,
		submissionData,
		containerId,
		startTime
	) {
		return this.__getDataForSubmission(
			questionSet,
			submissionData,
			containerId,
			startTime,
			'QuestionSubmission',
			'application/vnd.nextthought.assessment.questionsubmission',
			'questionId'
		);
	},

	__getDataForSurveySubmission: function (
		survey,
		submissionData,
		containerId,
		startTime
	) {
		var data = this.__getDataForSubmission(
			survey,
			submissionData,
			containerId,
			startTime,
			'PollSubmission',
			'application/vnd.nextthought.assessment.pollsubmission',
			'pollId'
		);

		data.surveyId = data.questionSetId;
		data.version = survey.get('version');

		delete data.questionSetId;

		return data;
	},

	gradeAssessment: function (
		questionSet,
		submissionData,
		container,
		startTime
	) {
		var data = this.__getDataForQuestionSubmission(
				questionSet,
				submissionData,
				container.NTIID,
				startTime
			),
			qsetSubmission;

		qsetSubmission = AssessmentQuestionSetSubmission.create(data);

		const coursePagesLink =
			container.currentBundle && container.currentBundle.getLink('Pages');

		return new Promise(function (fulfill, reject) {
			qsetSubmission.save({
				url:
					questionSet.getLink('PracticeSubmission') ||
					coursePagesLink,
				callback: function () {},
				success: function (self, op) {
					var result = op.getResultSet().records.first();

					questionSet
						.getInterfaceInstance()
						.then(q => Events.emit(Events.ASSESSMENT_SUBMITTED, q));

					fulfill(result);
				},
				failure: function () {
					console.error('FAIL', arguments);
					alert('There was a problem grading your quiz.');
					reject();
				},
			});
		});
	},

	getObjectURL: function (id) {
		return Service.getObjectURL(id);
	},

	getAssessmentSubmissionURL(id, bundle) {
		return (bundle && bundle.getAssessmentURL(id)) || this.getObjectURL(id);
	},

	getInquirySubmissionURL(id, bundle) {
		return (bundle && bundle.getInquiriesURL(id)) || this.getObjectURL(id);
	},

	submitSurvey: function (
		survey,
		submissionData,
		containerId,
		startTime,
		bundle
	) {
		var data = this.__getDataForSurveySubmission(
				survey,
				submissionData,
				containerId,
				startTime
			),
			surveySubmission,
			me = this;

		surveySubmission = AssessmentSurveySubmission.create(data);

		return new Promise(function (fulfill, reject) {
			surveySubmission.save({
				url: me.getInquirySubmissionURL(survey.getId(), bundle),
				success: function (self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				},
				failure: function (rec, resp) {
					let err = resp && resp.error;
					if (err && err.status === 409) {
						me.handleSurveyConflictError(survey);
					} else {
						console.error('Failed to submit survey: ', arguments);
						alert('There was a problem submitting your survey.');
					}
					reject(err);
				},
			});
		});
	},

	submitAssignment: function (
		questionSet,
		submissionData,
		containerId,
		startTime,
		bundle
	) {
		var data = this.__getDataForQuestionSubmission(
				questionSet,
				submissionData,
				containerId,
				startTime
			),
			assignment = questionSet && questionSet.associatedAssignment,
			assignmentId = assignment.getId(),
			qsetSubmission,
			assignmentSubmission;

		data.CreatorRecordedEffortDuration +=
			questionSet.getPreviousEffortDuration();

		qsetSubmission = AssessmentQuestionSetSubmission.create(data);
		assignmentSubmission = AssessmentAssignmentSubmission.create({
			assignmentId: assignmentId,
			parts: [qsetSubmission],
			CreatorRecordedEffortDuration: data.CreatorRecordedEffortDuration,
			version: assignment.get('version'),
		});

		if (assignment && assignment.getLink('PracticeSubmission')) {
			return this.doSubmitAssignment(
				assignmentSubmission,
				assignment,
				true
			);
		} else {
			return this.doSubmitAssignment(
				assignmentSubmission,
				assignment,
				false,
				bundle
			);
		}
	},

	doSubmitAssignment: function (
		assignmentSubmission,
		assignment,
		isPracticeSubmission,
		bundle
	) {
		const assignmentId = assignment.getId();
		const me = this;
		const link = isPracticeSubmission
			? assignment.getLink('PracticeSubmission')
			: me.getAssessmentSubmissionURL(assignmentId, bundle);
		let responseJSON;

		assignmentSubmission.getProxy().on(
			'exception',
			(proxy, response) => {
				responseJSON = Ext.JSON.decode(response.responseText, true);
			},
			this
		);

		return new Promise(function (fulfill, reject) {
			assignmentSubmission.save({
				url: link,
				success: function (self, op) {
					var pendingAssessment = op.getResultSet().records[0],
						result = pendingAssessment.get('parts')[0],
						itemLink = pendingAssessment.getLink(
							'AssignmentHistoryItem'
						);

					assignment.setHistoryLink(itemLink);

					assignment
						.getInterfaceInstance()
						.then(a => Events.emit(Events.ASSIGNMENT_SUBMITTED, a));

					fulfill({
						result: result,
						itemLink: itemLink,
						assignmentId: assignmentId,
						isPracticeSubmission,
					});
				},
				failure: function (rec, resp) {
					console.error('FAIL', arguments);
					let err = resp && resp.error;
					if (err && err.status === 409) {
						me.handleConflictError(assignment);
					} else if (
						err &&
						(err.status === 404 || err.status === 403)
					) {
						me.handleDeletionError(assignment);
					} else if (
						err &&
						err.status === 422 &&
						responseJSON &&
						responseJSON.field === 'filename'
					) {
						me.handleFileUploadError(assignment);
					} else {
						alert(
							'There was a problem submitting your assignment.'
						);
					}
					reject(err);
				},
			});
		});
	},

	saveProgress: function (
		questionSet,
		submissionData,
		startTime,
		onSubmitted
	) {
		var data = this.__getDataForQuestionSubmission(
				questionSet,
				submissionData,
				'',
				startTime
			),
			qsetSubmission,
			assignmentSubmission,
			assignment = questionSet.associatedAssignment;

		data.CreatorRecordedEffortDuration +=
			questionSet.getPreviousEffortDuration();

		qsetSubmission = AssessmentQuestionSetSubmission.create(data);
		assignmentSubmission = AssessmentAssignmentSubmission.create({
			assignmentId: assignment.getId(),
			parts: [qsetSubmission],
			CreatorRecordedEffortDuration: data.CreatorRecordedEffortDuration,
			version: assignment.get('version'),
		});

		return this.doSaveProgress(
			assignmentSubmission,
			assignment,
			onSubmitted
		);
	},

	doSaveProgress: function (assignmentSubmission, assignment, onSubmitted) {
		const url = assignment && assignment.getLink('Savepoint');
		const me = this;

		if (!url) {
			console.error('No url to save assignment progress to');
			return Promise.reject();
		}

		return new Promise(function (fulfill) {
			assignmentSubmission.save({
				url: url,
				success: function (self, op) {
					let result = op.getResultSet().records[0];
					fulfill(result);
				},
				failure: function (rec, resp) {
					console.error('Failed to save assignment progress');
					let err = resp && resp.error;
					if (err && err.status === 409) {
						me.handleConflictError(assignment);
					} else if (err && err.status === 403) {
						if (
							err.responseJson &&
							err.responseJson.code ===
								'SubmissionPastDueDateError'
						) {
							me.handlePastDueError(assignment);
						} else {
							me.handleUnavailableError(assignment);
						}
					} else if (err && err.status === 404) {
						me.handleDeletionError(assignment);
					} else if (err && err.status === 422) {
						if (
							err.responseJson &&
							err.responseJson.code ===
								'MissingMetadataAttemptInProgressError'
						) {
							me.handleNoAttemptInProgress(
								assignment,
								onSubmitted
							);
						}
					}

					fulfill(err);
				},
			});
		});
	},

	handleNoAttemptInProgress(assignment, onSubmitted) {
		Ext.MessageBox.alert({
			title: t('assignments.errors.alreadySubmitted.title'),
			msg: t('assignments.errors.alreadySubmitted.msg'),
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: t('assignments.errors.alreadySubmitted.button'),
				},
			},
			fn: button => {
				if (button === 'yes' && assignment) {
					assignment.updateFromServer().then(async () => {
						try {
							const history = await assignment.getHistory();
							const pendingAssessment =
								history.get('pendingAssessment');
							const result = pendingAssessment.get('parts')[0];

							if (onSubmitted) {
								onSubmitted({
									result,
									itemLink: assignment.getLink('History'),
									assignmentId: assignment.getId(),
								});
							}
						} catch (e) {
							//swallow
						}
					});
				}
			},
		});
	},

	handlePastDueError: function (assignment) {
		Ext.MessageBox.alert({
			title: t('assignments.errors.pastDue.title'),
			msg: t('assignments.errors.pastDue.msg'),
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: t('assignments.errors.pastDue.button'),
				},
			},
			fn: function (button) {},
		});
	},

	handleConflictError: function (assignment) {
		Ext.MessageBox.alert({
			title: t('assignments.errors.conflict.title'),
			msg: t('assignments.errors.conflict.msg'),
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: t('assignments.errors.conflict.button'),
				},
			},
			fn: function (button) {
				if (button === 'yes' && assignment) {
					assignment.updateFromServer().then(function () {
						assignment.fireEvent('refresh');
					});
				}
			},
		});
	},

	handleSurveyConflictError: function (survey) {
		Ext.MessageBox.alert({
			title: 'This survey has changed',
			msg: 'Clicking OK will reload the survey',
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: 'OK',
				},
			},
			fn: function (button) {
				if (button === 'yes' && survey) {
					survey.updateFromServer().then(function () {
						survey.fireEvent('refresh');
					});
				}
			},
		});
	},

	handleUnavailableError(assignment) {
		Ext.MessageBox.alert({
			title: t('assignments.errors.unavailable.title'),
			msg: t('assignments.errors.unavailable.msg'),
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: t('assignments.errors.unavailable.button'),
				},
			},
			fn: function (button) {
				if (button === 'yes' && assignment) {
					assignment.fireEvent('deleted');
				}
			},
		});
	},

	handleDeletionError: function (assignment) {
		Ext.MessageBox.alert({
			title: t('assignments.errors.deletion.title'),
			msg: t('assignments.errors.deletion.msg'),
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: t('assignments.errors.deletion.button'),
				},
			},
			fn: function (button) {
				if (button === 'yes' && assignment) {
					assignment.fireEvent('deleted');
				}
			},
		});
	},

	handleFileUploadError: function (assignment) {
		Ext.MessageBox.alert({
			title: t('assignments.errors.fileupload.title'),
			msg: t('assignments.errors.fileupload.msg'),
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: t('assignments.errors.fileupload.button'),
				},
			},
			fn: function (button) {
				if (button === 'yes' && assignment) {
					assignment.updateFromServer().then(function () {
						assignment.fireEvent('refresh');
					});
				}
			},
		});
	},

	checkAnswer: function (
		question,
		answerValues,
		startTime,
		canSubmitIndividually
	) {
		var endTimestamp = new Date().getTime(),
			// in seconds
			// TODO We may have to reset startTimestamp, depending on flow.
			// SelfAssessments (and maybe assignments) could be re-submitted.
			duration = (endTimestamp - startTime) / 1000,
			readerContext = this.ContextStore.getReaderLocation(),
			containerId = canSubmitIndividually
				? question.getId()
				: readerContext.NTIID,
			submission = AssessmentQuestionSubmission.create({
				ContainerId: containerId,
				questionId: question.getId(),
				parts: answerValues,
				CreatorRecordedEffortDuration: duration,
			});

		return new Promise(function (fulfill, reject) {
			submission.save({
				failure: function () {
					console.error('FAIL', arguments);
					reject();
				},
				success: function (self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				},
			});
		});
	},

	submitPoll: function (
		poll,
		answerValues,
		startTime,
		canSubmitIndividually,
		bundle
	) {
		var endTimeStamp = new Date().getTime(),
			// in seconds
			// TODO We may have to reset startTimestamp, depending on flow.
			// SelfAssessments (and maybe assignments) could be re-submitted.
			duration = (endTimeStamp - startTime) / 1000,
			// readerContext = this.ContextStore.getReaderLocation(),
			// containerId = canSubmitIndividually ? poll.getId() : readerContext.NTIID,
			submission = AssessmentPollSubmission.create({
				// ContainerId: containerId,
				pollId: poll.getId(),
				questionId: poll.getId(),
				parts: answerValues,
				CreatorRecordedEffortDuration: duration,
				version: poll.get('version'),
			});

		return new Promise((fulfill, reject) => {
			submission.save({
				url: this.getInquirySubmissionURL(poll.getId(), bundle),
				failure: function () {
					console.error('Failed to save poll: ', arguments);
					reject();
				},
				success: function (self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				},
			});
		});
	},
});
