Ext.define('NextThought.controller.Assessment', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location'
	],

	models: [
		'assessment.AssessedPart',
		'assessment.AssessedQuestion',
		'assessment.AssessedQuestionSet',
		'assessment.DictResponse',
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
		this.control({
			'abstract-question-input':{
				'check-answer': this.checkAnswer
			},

			'assessment-quiz-submission': {
				'grade-it': this.grade
			}
		});
	},


	checkAnswer: function(questionWidget,question,part,answerValue){

		var submission = this.getAssessmentQuestionSubmissionModel().create({
			ContainerId: LocationProvider.currentNTIID,
			questionId: question.getId(),
			parts: [answerValue]
		});

		questionWidget.mask('Grading...');

		submission.save({
			scope: this,
			callback: function(){questionWidget.unmask();},
			failure: function(){
				console.error('FAIL', arguments);
				alert('There was a problem grading your question');
			},
			success: function(self,op){
				var result = op.getResultSet().records.first().isCorrect();
				if(result){
					questionWidget.markCorrect();
				}
				else {
					questionWidget.markIncorrect();
				}
			}
		});
	},


	grade: function(submissionWidget,questionSet,submissionData){

		var q = this.getAssessmentQuestionSubmissionModel(),
			s = this.getAssessmentQuestionSetSubmissionModel(),
			data = {
				ContainerId: LocationProvider.currentNTIID,
				questionSetId: questionSet.getId(),
				questions: []
			};

		Ext.Object.each(submissionData,function(k,v){
			data.questions.push({
				'Class':'QuestionSubmission',
				MimeType:'application/vnd.nextthought.assessment.questionsubmission',
				ContainerId: LocationProvider.currentNTIID,
				NTIID: k,
				questionId: k,
				parts: v
			});
		});

		s.create(data).save({
			scope: this,
			callback: function(){},
			failure: function(){
				console.error('FAIL', arguments);
				alert('There was a problem grading your quiz');
			},
			success: function(self,op){
				var result = op.getResultSet().records.first();
				submissionWidget.setGradingResult(result);
			}
		});
	}
});
