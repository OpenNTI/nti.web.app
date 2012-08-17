Ext.define('NextThought.view.assessment.Scoreboard',{
	extend: 'NextThought.view.assessment.Panel',
	alias: 'widget.assessment-scoreboard',
	requires: [
		'NextThought.view.assessment.Score',
		'NextThought.view.assessment.ScoreboardHeader',
		'NextThought.view.assessment.ScoreboardTally',
		'NextThought.view.assessment.QuizSubmission'
	],

	cls: 'scoreboard',

	layout: {
		type: 'hbox',
		align: 'middle'
	},

	dockedItems: [
		{ dock: 'top', xtype: 'assessment-scoreboard-header'}
	],

	items: [
		{ xtype:'assessment-score' },
		{ xtype: 'assessment-tally', flex: 1 },
		{ xtype: 'button',
			text: 'I can do better!',
			ui: 'secondary',
			scale: 'large',
			handler: function(b){b.up('assessment-scoreboard').resetClicked();}
		}
	],


	initComponent: function(){
		this.callParent(arguments);
		this.hide();//we have to pre-render then hide. We hide until after grading, or preset the previously taken quiz.

		this.mon(this.questionSet,{
			scope: this,
			'graded':this.updateWithResults,
			'reset': this.doReset
		});
	},


	doReset:function(){
		this.hide();
		this.reader.scrollTo(0);
	},


	updateWithResults: function(assessedQuestionSet){
		var questions = assessedQuestionSet.get('questions'),
			correct = 0, total = questions.length;

		Ext.each(questions,function(q){
			if(q.isCorrect()){ correct ++; }
		});


		this.down('assessment-tally').setTally(correct,total);
		this.down('assessment-score').setValue(Math.floor(100*correct/total));

		this.show();
		this.reader.scrollTo(0);
	},



	afterRender: function(){
		this.callParent(arguments);
	}

}, function(){
	this.borrow(NextThought.view.assessment.QuizSubmission, ['resetClicked']);
});
