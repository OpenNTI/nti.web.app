Ext.define('NextThought.controller.Assessment', {
	extend: 'Ext.app.Controller',

	models: [
		'assessment.AssessedPart',
		'assessment.AssessedQuestion',
		'assessment.AssessedQuestionSet',
		'assessment.AssessmentItemContainer',
		'assessment.Assignment',
		'assessment.AssignmentPart',
		'assessment.AssignmentSubmission',
		'assessment.AssignmentSubmissionPendingAssessment',
		'assessment.DictResponse',
		'assessment.FilePart',
		'assessment.FreeResponsePart',
		'assessment.FreeResponseSolution',
		'assessment.Hint',
		'assessment.HTMLHint',
		'assessment.LatexSymbolicMathSolution',
		'assessment.MatchingPart',
		'assessment.MatchingSolution',
		'assessment.MathPart',
		'assessment.MathSolution',
		'assessment.MultipleChoicePart',
		'assessment.MultipleChoiceSolution',
		'assessment.NumericMathPart',
		'assessment.NumericMathSolution',
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
		'assessment.TextResponse'
	],

	views: [
		'assessment.Header',
		'assessment.Question',
		'assessment.Parts',
		'assessment.input.Base',
		'assessment.input.SymbolicMath'
	],

	refs: [],

	init: function() {
		this.listen({
			component: {
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


	checkAnswer: function(questionWidget, question, answerValues) {

		var containerId = questionWidget.canSubmitIndividually() ? question.getId() : questionWidget.reader.getLocation().NTIID,
			submission = this.getAssessmentQuestionSubmissionModel().create({
			ContainerId: containerId,
			questionId: question.getId(),
			parts: answerValues
		});

		questionWidget.mask('Grading...');

		submission.save({
			scope: this,
			callback: function() {questionWidget.unmask();},
			failure: function() {
				console.error('FAIL', arguments);
				alert('There was a problem grading your question');
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

		var s = this.getAssessmentQuestionSetSubmissionModel(),
			data = {
				ContainerId: submissionWidget.reader.getLocation().NTIID,
				questionSetId: questionSet.getId(),
				questions: []
			};

		Ext.Object.each(submissionData, this.__getQuestionSubmissions(data));

		s.create(data).save({
			scope: this,
			callback: function() {},
			failure: function() {
				console.error('FAIL', arguments);
				alert('There was a problem grading your quiz');
			},
			success: function(self, op) {
				var result = op.getResultSet().records.first();
				submissionWidget.setGradingResult(result);
			}
		});
	},


	submit: function(widget, questionSet, data) {

		var s = this.getAssessmentQuestionSetSubmissionModel(),
			a = this.getAssessmentAssignmentSubmissionModel(),
			//containerId = widget.reader.getLocation().NTIID,
			assignmentId = questionSet.associatedAssignment.getId(),
			qset = {
				questionSetId: questionSet.getId(),
				questions: []
			};

		Ext.Object.each(data, this.__getQuestionSubmissions(qset));


		a = a.create({
			assignmentId: assignmentId,
			//containerId: containerId,
			parts: [s.create(qset)]
		});

		a.save({url: Service.getObjectURL(assignmentId)});
	}
});
