Ext.define('NextThought.controller.Quiz', {
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
		'assessment.Response',
		'assessment.input.Base',
		'assessment.input.SymbolicMath'
	],

	refs: [],

	init: function() {
		this.control({
			'abstract-question-input':{
				'check-answer': this.checkAnswer
			}
		});
	},


	checkAnswer: function(questionWidget,question,part,answerValue){
//		questionWidget.reset();

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
	}
});
