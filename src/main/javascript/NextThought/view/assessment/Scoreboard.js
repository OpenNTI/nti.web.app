Ext.define('NextThought.view.assessment.Scoreboard',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.assessment-scoreboard',
	requires: [
		'NextThought.view.assessment.Score',
		'NextThought.view.assessment.ScoreboardHeader',
		'NextThought.view.assessment.ScoreboardTally',
		'NextThought.view.assessment.QuizSubmission'
	],

	cls: 'scoreboard',
	ui: 'assessment',

	hidden: true,
	layout: {
		type: 'hbox',
		align: 'middle'
	},

	items: [
		{ xtype:'assessment-score' },
		{ xtype: 'assessment-tally', flex: 1 },
		{ xtype: 'button',
			text: 'Try Again',
			ui: 'secondary',
			scale: 'large',
			handler: function(b){b.up('assessment-scoreboard').resetBasedOnButtonClick();}
		}
	],


	initComponent: function(){
		this.callParent(arguments);
		this.addDocked({ dock: 'top', xtype: 'assessment-scoreboard-header', questionSet: this.questionSet});

		this.hide();//we have to pre-render then hide. We hide until after grading, or preset the previously taken quiz.

		this.mon(this.questionSet,{
			scope: this,
			'graded':this.updateWithResults,
			'reset': this.doReset
		});
	},


	doReset:function(){
		this.hide();
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


	setPriorResults: function(assessedQuestionSet) {
		//Sort by date, so that the latest is as 0, and the oldest is at N:
		var sortedSets = Ext.Array.sort(assessedQuestionSet, function(a, b){
			var aDate = a.get('Last Modified').getTime(),
				bDate = b.get('Last Modified').getTime();
			if (aDate < bDate){return 1;}
		    if (aDate > bDate){return -1;}
		    return 0;
		});

		//Ask header to add menu items for each:
		this.down('assessment-scoreboard-header').setPriorResults(sortedSets);
	},

	afterRender: function(){
		this.callParent(arguments);
	}

}, function(){
	this.borrow(NextThought.view.assessment.QuizSubmission, ['resetBasedOnButtonClick', 'maybeDoReset']);
});
