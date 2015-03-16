Ext.define('NextThought.controller.Assessment', {
	extend: 'Ext.app.Controller',

	models: [
		'assessment.AssessedPart',
		'assessment.AssessedQuestion',
		'assessment.AssessedQuestionSet',
		'assessment.AssessmentItemContainer',
		'assessment.Assignment',
		'assessment.TimedAssignment',
		'assessment.AssignmentPart',
		'assessment.AssignmentSubmission',
		'assessment.AssignmentSubmissionPendingAssessment',
		'assessment.DictResponse',
		'assessment.FilePart',
		'assessment.FillInTheBlankShortAnswerPart',
		'assessment.FillInTheBlankShortAnswerSolution',
		'assessment.FillInTheBlankWithWordBankQuestion',
		'assessment.FillInTheBlankWithWordBankPart',
		'assessment.FillInTheBlankWithWordBankSolution',
		'assessment.FreeResponsePart',
		'assessment.FreeResponseSolution',
		'assessment.Hint',
		'assessment.HTMLHint',
		'assessment.LatexSymbolicMathSolution',
		'assessment.MatchingPart',
		'assessment.MatchingSolution',
		'assessment.MathPart',
		'assessment.MathSolution',
		'assessment.ModeledContentPart',
		'assessment.MultipleChoiceMultipleAnswerPart',
		'assessment.MultipleChoiceMultipleAnswerSolution',
		'assessment.MultipleChoicePart',
		'assessment.MultipleChoiceSolution',
		'assessment.NumericMathPart',
		'assessment.NumericMathSolution',
		'assessment.OrderingPart',
		'assessment.OrderingSolution',
		'assessment.Part',
		'assessment.Question',
		'assessment.QuestionMap',
		'assessment.QuestionSet',
		'assessment.QuestionSetSubmission',
		'assessment.QuestionSubmission',
		'assessment.Response',
		'assessment.SingleValuedSolution',
		'assessment.Solution',
		'assessment.SymbolicMathPart',
		'assessment.SymbolicMathSolution',
		'assessment.TextHint',
		'assessment.TextResponse',
		'assessment.RandomizedQuestionSet',
		'assessment.QuestionBank'
	],

	views: [
		'assessment.Header',
		'assessment.Question',
		'assessment.Parts',
		'assessment.input.Base',
		'assessment.input.SymbolicMath'
	],

	refs: [
		{ ref: 'assignmentView', selector: 'course-assessment' },
		{ ref: 'courseOverView', selector: 'course-overview'}
	],

	init: function() {
		this.submissionsWidgets = new Ext.util.MixedCollection();

		this.listen({
			component: {
				'*': {
					'has-been-submitted': 'maybeMarkSubmissionAsSubmitted',
					'set-assignment-history': 'applyAssessmentHistory',
					'assignment-reset': 'assignmentReset',
					'save-progress': 'saveProgress'
				},
				'assessment-question': {
					'check-answer': 'checkAnswer'
				},

				'assessment-quiz-submission': {
					'grade-it': 'grade',
					'submit-assignment': 'submit'
				}
			}
		});
	},


	maybeMarkSubmissionAsSubmitted: function(cmp) {
		var me = this,
			h = me.history,
			q = cmp.questionSet,
			a = q && q.associatedAssignment,
			o, s;

		a = (a && a.getId && a.getId()) || cmp.assignmentId;

		function add() {
			if (!me.submissionsWidgets.contains(cmp)) {
				me.submissionsWidgets.add(cmp);
				cmp.on('destroy', function() {
					me.submissionsWidgets.remove(cmp);
				});
			}
		}

		if (!a) { return; }

		add();

		o = h && h.getItem(a);
		if (o) {
			if (cmp.setGradingResult) {
				s = o.get('pendingAssessment').get('parts')[0];
				cmp.setGradingResult(s, o);
			} else if (cmp.setHistory) {
				cmp.setHistory(o);
			}
		}
	},


	applyAssessmentHistory: function(history) {
		var reader;

		this.history = history;
		this.submissionsWidgets.each(function(c) {
			try {
				//no need to do this more than once
				if (!reader) {
					reader = c.reader;

					if (reader) {
						reader.getAssessment().updateAssessmentHistory(history);
					}
				}

				this.maybeMarkSubmissionAsSubmitted(c);
			} catch (e) {
				Error.raiseForReport(e);
			}
		}, this);
	},


	checkAnswer: function(questionWidget, question, answerValues) {

		var endTimestamp = new Date().getTime();
		// in seconds
		// TODO We may have to reset startTimestamp, depending on flow.
		// SelfAssessments (and maybe assignments) could be re-submitted.
		var duration = (endTimestamp - questionWidget.startTimestamp) / 1000;

		var containerId = questionWidget.canSubmitIndividually() ? question.getId() : questionWidget.reader.getLocation().NTIID,
			submission = this.getAssessmentQuestionSubmissionModel().create({
			ContainerId: containerId,
			questionId: question.getId(),
			parts: answerValues,
			CreatorRecordedEffortDuration: duration
		});

		questionWidget.mask('Grading...');

		submission.save({
			scope: this,
			callback: function() {questionWidget.unmask();},
			failure: function() {
				console.error('FAIL', arguments);
				alert('There was a problem grading your question.');
			},
			success: function(self, op) {
				var result = op.getResultSet().records.first();
				questionWidget.updateWithResults(result);
			}
		});
	},


	__getQuestionSubmissions: function(data) {
		return function(k, v) {
			data.questions.push({
				'Class': 'QuestionSubmission',
				MimeType: 'application/vnd.nextthought.assessment.questionsubmission',
				ContainerId: data.ContainerId,
				NTIID: k,
				questionId: k,
				parts: v
			});
		};
	},


	grade: function(submissionWidget, questionSet, submissionData) {

		var endTimestamp = new Date().getTime();
		// in seconds
		// TODO We may have to reset startTimestamp, depending on flow.
		// SelfAssessments (and maybe assignments) could be re-submitted.
		var duration = (endTimestamp - submissionWidget.startTimestamp) / 1000;

		var me = this,
			s = me.getAssessmentQuestionSetSubmissionModel(),
			data = {
				ContainerId: submissionWidget.reader.getLocation().NTIID,
				questionSetId: questionSet.getId(),
				questions: [],
				CreatorRecordedEffortDuration: duration
			};

		Ext.Object.each(submissionData, me.__getQuestionSubmissions(data));

		s.create(data).save({
			scope: this,
			callback: function() {},
			failure: function() {
				console.error('FAIL', arguments);
				alert('There was a problem grading your quiz.');
				submissionWidget.onFailure();
			},
			success: function(self, op) {
				var result = op.getResultSet().records.first();
				submissionWidget.setGradingResult(result);

				me.getCourseOverView().updateAssessments(result);
			}
		});
	},


	submit: function(widget, questionSet, data) {

		var s = this.getAssessmentQuestionSetSubmissionModel(),
			a = this.getAssessmentAssignmentSubmissionModel(),
			endTimestamp = new Date().getTime(),
			// in seconds
			duration = (endTimestamp - widget.startTimestamp) / 1000,
			progress = this.getAssignmentView(),
			//containerId = widget.reader.getLocation().NTIID,
			assignmentId = questionSet.associatedAssignment.getId(),
			qset = {
				questionSetId: questionSet.getId(),
				questions: []
			};

		duration += questionSet.getPreviousEffortDuration();

		Ext.Object.each(data, this.__getQuestionSubmissions(qset));

		function safelyCall(fnName, scope) {
			try {
				scope[fnName].apply(scope, Array.prototype.slice.call(arguments, 2));
			}
			catch (e) {
				console.warn(e.stack || e.message || e);
			}
		}

		a = a.create({
			assignmentId: assignmentId,
			//containerId: containerId,
			parts: [s.create(qset)],
			CreatorRecordedEffortDuration: duration
		});
		safelyCall('mask', widget);
		a.save({
			url: Service.getObjectURL(assignmentId),
			success: function(self, op) {
				var collection = progress.assignmentsCollection,
					pendingAssessment = op.getResultSet().records.first(),
					update,
					itemLink = pendingAssessment.getLink('AssignmentHistoryItem'),
					result = pendingAssessment.get('parts').first();//hack?

				safelyCall('unmask', widget);
				safelyCall('setGradingResult', widget, result);


				if (itemLink && collection && collection.updateHistoryItem) {
					update = Service.request(itemLink)
						.then(function(response) {
							return JSON.parse(response);
						})
						.then(collection.updateHistoryItem.bind(collection, assignmentId));
				} else {
					update = Promise.resolve();
				}

				update.always(function() {
					if (progress.instance) {
						progress.bundleChanged(progress.instance);
					}
				});
			},
			failure: function() {
				console.error('FAIL', arguments);
				alert('There was a problem submitting your assignment.');
				safelyCall('onFailure', widget);
				safelyCall('maybeDoReset', widget, true);
				safelyCall('unmask', widget);
			}
		});
	},

	/**
	 * Posts the question set to the save point of the assignment to be restored
	 * next time they come back to the assignment
	 * @param  {QuestionSet} questionSet the question set the answers are for
	 * @param  {Object} data        the answers
	 * @param  {Function} callback what to do when its done (yuck callbacks, couldn't think of an alternative for the time being)
	 * @return {Boolean}             True is an attempt was made to save, false otherwise
	 */
	saveProgress: function(questionSet, data, callback) {
		var s = this.getAssessmentQuestionSetSubmissionModel(),
			a = this.getAssessmentAssignmentSubmissionModel(),
			endTimestamp = new Date().getTime(),
			//in seconds
			duration = (endTimestamp - questionSet.getStartTime()) / 1000,
			progress = this.getAssignmentView(),
			assignment = questionSet.associatedAssignment,
			url = assignment && assignment.getLink('Savepoint'),
			qset = {
				questionSetId: questionSet.getId(),
				questions: []
			};

		//keep a cumulative total running from the save points
		duration += questionSet.getPreviousEffortDuration();

		if (!url) {
			console.error('no url to save assignment progress to');
			return false;
		}

		Ext.Object.each(data, this.__getQuestionSubmissions(qset));

		a = a.create({
			assignmentId: assignment.getId(),
			parts: [s.create(qset)],
			CreatorRecordedEffortDuration: duration
		});

		a.save({
			url: url,
			success: function(self, op) {
				var result = op.getResultSet().records.first();

				if (callback) {
					callback.call(null, result);
				}
			},
			failure: function() {
				console.error('Failed to save assignment progress');

				if (callback) {
					callback.call(null);
				}
			}
		});

		return true;
	},


	assignmentReset: function() {
		var assignment = this.getAssignmentView();

		if (assignment.instance) {
			assignment.bundleChanged(assignment.instance);
		}
	}
});
