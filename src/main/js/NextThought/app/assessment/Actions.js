Ext.define('NextThought.app.assessment.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.model.assessment.QuestionSetSubmission',
		'NextThought.model.assessment.AssignmentSubmission',
		'NextThought.model.assessment.QuestionSubmission',
		'NextThought.app.context.StateStore'
	],

	constructor: function() {
		this.callParent(arguments);

		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},


	__getDataForSubmission: function(questionSet, submissionData, containerId, startTime) {
		var me = this, key, value,
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

				data.questions.push({
					'Class': 'QuestionSubmission',
					MimeType: 'application/vnd.nextthought.assessment.questionsubmission',
					ContainerId: containerId,
					NTIID: key,
					questionId: key,
					parts: value
				});
			}
		}

		return data;
	},


	gradeAssessment: function(questionSet, submissionData, containerId, startTime) {
		var data = this.__getDataForSubmission(questionSet, submissionData, containerId, startTime),
			qsetSubmission;

		qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(data);

		return new Promise(function(fulfill, reject) {
			qsetSubmission.save({
				callback: function() {},
				success: function(self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				},
				failure: function() {
					console.error('FAIL', arguments);
					alert('There was a problem grading your quiz.');
					reject();
				}
			});
		});
	},


	submitAssignment: function(questionSet, submissionData, containerId, startTime) {
		var data = this.__getDataForSubmission(questionSet, submissionData, containerId, startTime),
			assignmentId = questionSet.associatedAssignment.getId(),
			qsetSubmission, assignmentSubmission;

		data.CreatorRecordedEffortDuration += questionSet.getPreviousEffortDuration();

		qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(data);
		assignmentSubmission = NextThought.model.assessment.AssignmentSubmission.create({
			assignmentId: assignmentId,
			parts: [qsetSubmission],
			CreatorRecordedEffortDuration: data.CreatorRecordedEffortDuration
		});


		return new Promise(function(fulfill, reject) {
			assignmentSubmission.save({
				url: Service.getObjectURL(assignmentId),
				success: function(self, op) {
					var pendingAssessment = op.getResultSet().records.first(),
						result = pendingAssessment.get('parts').first(),
						itemLink = pendingAssessment.getLink('AssignmentHistoryItem');

					fulfill({
						result: result,
						itemLink: itemLink,
						assignmentId: assignmentId
					});
				},
				fail: function() {
					console.error('FAIL', arguments);
					alert('There was a problem submitting your assignment.');
					reject();
				}
			});
		});
	},


	saveProgress: function(questionSet, submissionData, startTime) {
		var data = this.__getDataForSubmission(questionSet, submissionData, '', startTime),
			qsetSubmission, assignmentSubmission,
			assignment = questionSet.associatedAssignment,
			url = assignment && assignment.getLink('Savepoint');

		if (!url) {
			console.error('No url to save assignemnt progress to');
			return Promise.reject();
		}

		data.CreatorRecordedEffortDuration += questionSet.getPreviousEffortDuration();

		qsetSubmission = NextThought.model.assessment.QuestionSetSubmission.create(data);
		assignmentSubmission = NextThought.model.assessment.AssignmentSubmission.create({
			assignmentId: assignment.getId(),
			parts: [qsetSubmission],
			CreatorRecordedEffortDuration: data.CreatorRecordedEffortDuration
		});

		return new Promise(function(fulfill, reject) {
			assignmentSubmission.save({
				url: url,
				success: function(self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				},
				failure: function() {
					console.error('Failed to save assignment progress');

					fulfill(null);
				}
			});
		});
	},


	checkAnswer: function(question, answerValues, startTime, canSubmitIndividually) {
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


		return new Promise(function(fulfill, reject) {
			submission.save({
				failure: function() {
					console.error('FAIL', arguments);
					reject();
				},
				success: function(self, op) {
					var result = op.getResultSet().records.first();

					fulfill(result);
				}
			});
		});
	}
});
