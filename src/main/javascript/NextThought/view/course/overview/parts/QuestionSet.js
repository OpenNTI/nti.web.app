Ext.define('NextThought.view.course.overview.parts.QuestionSet',{
	extend: 'Ext.Panel',
	alias: [
		'widget.course-overview-naquestionset'
	],

	requires: [
		'NextThought.view.assessment.Score',
		'NextThought.view.assessment.ScoreboardHeader',
		'NextThought.view.assessment.ScoreboardTally'
	],

	cls: 'scoreboard overview-naquestionset',
	ui: 'assessment',

	layout: {
		type: 'hbox',
		align: 'middle'
	},

	items: [
		{ xtype:'assessment-score' },
		{ xtype: 'assessment-tally', flex: 1 },
		{ xtype: 'button',
			text: 'Review',
			ui: 'secondary',
			scale: 'large',
			handler: function(b){b.up('course-overview-naquestionset').reviewClicked();}
		}
	],

	constructor: function(config){
		var n = config.node;

		config.data = {
			correct: parseInt(n.getAttribute('correct'), 10),
			incorrect: parseInt(n.getAttribute('incorrect'), 10),
			title: n.getAttribute('label'),
			gotoNtiid: n.getAttribute('gotoNtiid')
		};

		this.callParent([config]);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.updateWithScore(this.data.correct, this.data.incorrect+this.data.correct);
	},

	updateWithScore: function(correct, total){
		var tally = this.down('assessment-tally');
		tally.setTally(correct,total);
		tally.message.update(this.data.title);
		this.down('assessment-score').setValue(Math.floor(100*correct/total)||0);
	},

	reviewClicked: function(){
		console.log('navigate to', this.data.gotoNtiid);
		this.fireEvent('navigate-to-href', this, this.data.gotoNtiid)
	}
});
