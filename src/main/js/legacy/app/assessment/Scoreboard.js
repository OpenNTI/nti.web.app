var Ext = require('extjs');
var OverlayPanel = require('../contentviewer/overlay/Panel');
var ChartScore = require('../../common/chart/Score');
var AssessmentScore = require('./Score');
var AssessmentScoreboardHeader = require('./ScoreboardHeader');
var AssessmentScoreboardTally = require('./ScoreboardTally');
var AssessmentQuizSubmission = require('./QuizSubmission');


module.exports = exports = Ext.define('NextThought.app.assessment.Scoreboard', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.assessment-scoreboard',
	cls: 'scoreboard',
	ui: 'assessment',
	hidden: true,

	layout: {
		type: 'hbox',
		align: 'middle'
	},

	items: [
		{ xtype: 'assessment-score' },
		{ xtype: 'assessment-tally', flex: 1 },
		{ xtype: 'button',
			text: getString('NextThought.view.assessment.Scoreboard.redo'),
			ui: 'secondary',
			scale: 'large',
			handler: function (b) {b.up('assessment-scoreboard').resetBasedOnButtonClick();}
		}
	],

	shouldShow: true,

	initComponent: function () {
		this.callParent(arguments);
		this.addDocked({ dock: 'top', xtype: 'assessment-scoreboard-header', questionSet: this.questionSet});

		this.hide();//we have to pre-render then hide. We hide until after grading, or preset the previously taken quiz.

		this.isAssignment = Boolean(this.questionSet && this.questionSet.associatedAssignment);
		this.shouldShow = !this.isAssignment;

		this.mon(this.questionSet, {
			scope: this,
			'graded': this.updateWithResults,
			'reset': this.doReset,
			'hide-quiz-submission': 'disableView'
		});
	},

	doReset: function () {
		this.hide();

		wait()
			.then(this.realignAnnotations.bind(this));
	},

	realignAnnotations: function () {
		var annotations = this.reader.getAnnotations();

		annotations.realignAnnotations();
	},

	disableView: function () {
		this.shouldShow = false;
		this.hide();
	},

	updateWithResults: function (assessedQuestionSet) {
		if (!this.shouldShow || this.questionSet.associatedAssignment) {
			return;
		}

		var questions = assessedQuestionSet.get('questions'),
			correct = 0, total = questions.length;

		Ext.each(questions, function (q) {
			if (q.isCorrect()) { correct++; }
		});

		this.updateWithScore(correct, total);

		this.show();
		this.reader.getScroll().to(0);

		wait()
			.then(this.realignAnnotations.bind(this));
	},

	updateWithScore: function (correct, total) {
		this.down('assessment-tally').setTally(correct, total);
		this.down('assessment-score').setValue(Math.floor(100 * correct / total) || 0);
	},

	setPriorResults: function (assessedQuestionSet) {
		if (!this.shouldShow) {return;}

		//Sort by date, so that the latest is as 0, and the oldest is at N:
		var sortedSets = Ext.Array.sort(assessedQuestionSet, function (a, b) {
			var aDate = a.get('Last Modified').getTime(),
				bDate = b.get('Last Modified').getTime();
			if (aDate < bDate) {return 1;}
			if (aDate > bDate) {return -1;}
			return 0;
		});

		//Ask header to add menu items for each:
		this.down('assessment-scoreboard-header').setPriorResults(sortedSets);

		/*
		* Wrapping it in an if, so we can keep it from automatically setting it graded
		* from a config if we want to.
		*/
		//if(){
		this.show();
		this.questionSet.fireEvent('graded', assessedQuestionSet[0], {orgin: this});
		//}
	},

	afterRender: function () {
		this.callParent(arguments);
	}
}, function () {
	this.borrow(NextThought.app.assessment.QuizSubmission, ['resetBasedOnButtonClick', 'maybeDoReset']);
});
