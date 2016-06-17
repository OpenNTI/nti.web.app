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

	submitSurvey: function (survey, submissionData, containerId, startTime) {
		var data = this.__getDataForSurveySubmission(survey, submissionData, containerId, startTime),
			surveySubmission;

		surveySubmission = NextThought.model.assessment.SurveySubmission.create(data);

		return new Promise(function (fulfill, reject) {
			surveySubmission.save({
				url: Service.getObjectURL(survey.getId()),
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

	submitAssignment: function (questionSet, submissionData, containerId, startTime) {
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

		let me = this;

		return new Promise(function (fulfill, reject) {
			assignmentSubmission.save({
				url: Service.getObjectURL(assignmentId),
				success: function (self, op) {
					var pendingAssessment = op.getResultSet().records.first(),
						result = pendingAssessment.get('parts').first(),
						itemLink = pendingAssessment.getLink('AssignmentHistoryItem');

					questionSet.associatedAssignment.setHistoryLink(itemLink);

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
					}
					else {
						alert('There was a problem submitting your assignment.');
					}
					reject();
				}
			});
		});
	},

	saveProgress: function (questionSet, submissionData, startTime) {
		var data = this.__getDataForQuestionSubmission(questionSet, submissionData, '', startTime),
			qsetSubmission, assignmentSubmission,
			assignment = questionSet.associatedAssignment,
			url = assignment && assignment.getLink('Savepoint'),
			me = this;

		if (!url) {
			console.error('No url to save assignemnt progress to');
			return Promise.reject();
		}

		data.CreatorRecordedEffortDuration += questionSet.getPreviousEffortDuration();

		qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(data);
		assignmentSubmission = NextThought.model.assessment.AssignmentSubmission.create({
			assignmentId: assignment.getId(),
			parts: [qsetSubmission],
			CreatorRecordedEffortDuration: data.CreatorRecordedEffortDuration,
			version: assignment.get('version')
		});

		return new Promise(function (fulfill, reject) {
			assignmentSubmission.save({
				url: url,
				success: function (self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				},
				failure: function (rec, resp) {
					console.error('Failed to save assignment progress');
					var err = resp && resp.error;
					if (err && err.status === 409) {
						me.handleConflictError(assignment);
					}
					fulfill(null);
				}
			});
		});
	},


	handleConflictError: function (assignemnt) {
		Ext.MessageBox.alert({
			title: 'This assignemnt has changed',
			msg: 'Clicking OK will reload the assignemnt',
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					text: 'OK'
				}
			},
			fn: function (button) {
				if (button === 'yes' && assignemnt) {
					assignemnt.updateFromServer()
						.then(function () {
							assignemnt.fireEvent('refresh');
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

	submitPoll: function (poll, answerValues, startTime, canSubmitIndividually) {
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

		return new Promise(function (fulfill, reject) {
			submission.save({
				url: Service.getObjectURL(poll.getId()),
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
