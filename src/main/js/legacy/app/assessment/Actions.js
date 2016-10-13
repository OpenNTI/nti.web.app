var Ext = require('extjs');
var CommonActions = require('../../common/Actions');
var AssessmentQuestionSetSubmission = require('../../model/assessment/QuestionSetSubmission');
var AssessmentAssignmentSubmission = require('../../model/assessment/AssignmentSubmission');
var AssessmentQuestionSubmission = require('../../model/assessment/QuestionSubmission');
var AssessmentSurveySubmission = require('../../model/assessment/SurveySubmission');
var AssessmentPollSubmission = require('../../model/assessment/PollSubmission');
var AssessmentUsersCourseInquiryItemResponse = require('../../model/assessment/UsersCourseInquiryItemResponse');
var ContextStateStore = require('../context/StateStore');


module.exports = exports = Ext.define('NextThought.app.assessment.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},

	__getDataForSubmission: function (questionSet, submissionData, containerId, startTime, questionCls, questionMime, questionId) {
		var me = this, key, value, qData,
			endTimeStamp = (new Date()).getTime(),
			//in seconds
			duration = (endTimeStamp - startTime) / 1000,
			data = {
				ContainerId: containerId,
				questionSetId: questionSet.getId(),
				questions: [],
				CreatorRecordedEffortDuration: duration
			};

		for (key in submissionData) {
			if (submissionData.hasOwnProperty(key)) {
				value = submissionData[key];

				qData = {
					'Class': questionCls,
					MimeType: questionMime,
					ContainerId: containerId,
					NTIID: key,
					parts: value
				};

				qData[questionId] = key;

				data.questions.push(qData);
			}
		}

		return data;
	},

	__getDataForQuestionSubmission: function (questionSet, submissionData, containerId, startTime) {
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

	__getDataForSurveySubmission: function (survey, submissionData, containerId, startTime) {
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

		delete data.questionSetId;

		return data;
	},

	gradeAssessment: function (questionSet, submissionData, containerId, startTime) {
		var data = this.__getDataForQuestionSubmission(questionSet, submissionData, containerId, startTime),
			qsetSubmission;

		qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(data);

		return new Promise(function (fulfill, reject) {
			qsetSubmission.save({
				url: questionSet.getLink('PracticeSubmission'),
				callback: function () {},
				success: function (self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				},
				failure: function () {
					console.error('FAIL', arguments);
					alert('There was a problem grading your quiz.');
					reject();
				}
			});
		});
	},

	getObjectURL: function (id) {
		return Service.getObjectURL(id);
	},


	getAssessmentSubmissionURL (id, bundle) {
		return (bundle && bundle.getAssessmentURL(id)) || this.getObjectURL(id);
	},

	getInquirySubmissionURL (id, bundle) {
		return (bundle && bundle.getInquiriesURL(id)) || this.getObjectURL(id);
	},


	submitSurvey: function (survey, submissionData, containerId, startTime, bundle) {
		var data = this.__getDataForSurveySubmission(survey, submissionData, containerId, startTime),
			surveySubmission, me = this;

		surveySubmission = NextThought.model.assessment.SurveySubmission.create(data);

		return new Promise(function (fulfill, reject) {
			surveySubmission.save({
				url: me.getInquirySubmissionURL(survey.getId(), bundle),
				success: function (self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				},
				failure: function () {
					console.error('Failed to submit survey: ', arguments);
					alert('There was a problem submitting your survey.');
					reject();
				}
			});
		});
	},

	submitAssignment: function (questionSet, submissionData, containerId, startTime, bundle) {
		var data = this.__getDataForQuestionSubmission(questionSet, submissionData, containerId, startTime),
			assignment = questionSet && questionSet.associatedAssignment,
			assignmentId = assignment.getId(),
			qsetSubmission, assignmentSubmission;

		data.CreatorRecordedEffortDuration += questionSet.getPreviousEffortDuration();

		qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(data);
		assignmentSubmission = NextThought.model.assessment.AssignmentSubmission.create({
			assignmentId: assignmentId,
			parts: [qsetSubmission],
			CreatorRecordedEffortDuration: data.CreatorRecordedEffortDuration,
			version: assignment.get('version')
		});

		if (assignment && assignment.getLink('PracticeSubmission')) {
			return this.doSubmitAssignment(assignmentSubmission, assignment, true);
		} else {
			return this.doSubmitAssignment(assignmentSubmission, assignment, false, bundle);
		}
	},

	doSubmitAssignment: function (assignmentSubmission, assignment, isPracticeSubmission, bundle) {
		const assignmentId = assignment.getId();
		const me = this;
		const link = isPracticeSubmission ? assignment.getLink('PracticeSubmission') : me.getAssessmentSubmissionURL(assignmentId, bundle);
		let responseJSON;

		assignmentSubmission.getProxy().on('exception', (proxy, response) => {
			responseJSON = Ext.JSON.decode(response.responseText);
		}, this);

		return new Promise(function (fulfill, reject) {
			assignmentSubmission.save({
				url: link,
				success: function (self, op) {
					var pendingAssessment = op.getResultSet().records[0],
						result = pendingAssessment.get('parts')[0],
						itemLink = pendingAssessment.getLink('AssignmentHistoryItem');

					assignment.setHistoryLink(itemLink);

					fulfill({
						result: result,
						itemLink: itemLink,
						assignmentId: assignmentId
					});
				},
				failure: function (rec, resp) {
					console.error('FAIL', arguments);
					let err = resp && resp.error;
					if (err && err.status === 409) {
						me.handleConflictError(assignment);
					} else if (err && (err.status === 404 || err.status === 403)) {
						me.handleDeletionError(assignment);
					} else if (err && err.status === 422 && responseJSON && responseJSON.field === 'filename') {
						me.handleFileUploadError(assignment);
					} else {
						alert('There was a problem submitting your assignment.');
					}
					reject(err);
				}
			});
		});
	},

	saveProgress: function (questionSet, submissionData, startTime) {
		var data = this.__getDataForQuestionSubmission(questionSet, submissionData, '', startTime),
			qsetSubmission, assignmentSubmission,
			assignment = questionSet.associatedAssignment;

		data.CreatorRecordedEffortDuration += questionSet.getPreviousEffortDuration();

		qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(data);
		assignmentSubmission = NextThought.model.assessment.AssignmentSubmission.create({
			assignmentId: assignment.getId(),
			parts: [qsetSubmission],
			CreatorRecordedEffortDuration: data.CreatorRecordedEffortDuration,
			version: assignment.get('version')
		});

		return this.doSaveProgress(assignmentSubmission, assignment);
	},


	doSaveProgress: function (assignmentSubmission, assignment) {
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
					} else if (err && (err.status === 404 || err.status === 403)) {
						me.handleDeletionError(assignment);
					}
					fulfill(err);
				}
			});
		});
	},

	handleConflictError: function (assignment) {
		Ext.MessageBox.alert({
			title: 'This assignment has changed',
			msg: 'Clicking OK will reload the assignment',
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: 'OK'
				}
			},
			fn: function (button) {
				if (button === 'yes' && assignment) {
					assignment.updateFromServer()
						.then(function () {
							assignment.fireEvent('refresh');
						});
				}
			}
		});
	},

	handleDeletionError: function (assignment) {
		Ext.MessageBox.alert({
			title: 'This assignment no longer exists',
			msg: 'Clicking OK will exit the assignment',
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: 'OK'
				}
			},
			fn: function (button) {
				if (button === 'yes' && assignment) {
					assignment.fireEvent('deleted');
				}
			}
		});
	},

	handleFileUploadError: function (assignment) {
		Ext.MessageBox.alert({
			title: 'A file upload question has changed',
			msg: 'Clicking OK will reload the assignment',
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: 'OK'
				}
			},
			fn: function (button) {
				if (button === 'yes' && assignment) {
					assignment.updateFromServer()
						.then(function () {
							assignment.fireEvent('refresh');
						});
				}
			}
		});
	},

	checkAnswer: function (question, answerValues, startTime, canSubmitIndividually) {
		var endTimestamp = (new Date()).getTime(),
			// in seconds
			// TODO We may have to reset startTimestamp, depending on flow.
			// SelfAssessments (and maybe assignments) could be re-submitted.
			duration = (endTimestamp - startTime) / 1000,
			readerContext = this.ContextStore.getReaderLocation(),
			containerId = canSubmitIndividually ? question.getId() : readerContext.NTIID,
			submission = NextThought.model.assessment.QuestionSubmission.create({
				ContainerId: containerId,
				questionId: question.getId(),
				parts: answerValues,
				CreatorRecordedEffortDuration: duration
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
				}
			});
		});
	},

	submitPoll: function (poll, answerValues, startTime, canSubmitIndividually, bundle) {
		var endTimeStamp = (new Date()).getTime(),
			// in seconds
			// TODO We may have to reset startTimestamp, depending on flow.
			// SelfAssessments (and maybe assignments) could be re-submitted.
			duration = (endTimeStamp - startTime) / 1000,
			readerContext = this.ContextStore.getReaderLocation(),
			containerId = canSubmitIndividually ? poll.getId() : readerContext.NTIID,
			submission = NextThought.model.assessment.PollSubmission.create({
				// ContainerId: containerId,
				pollId: poll.getId(),
				questionId: poll.getId(),
				parts: answerValues,
				CreatorRecordedEffortDuration: duration
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
				}
			});
		});
	}
});
