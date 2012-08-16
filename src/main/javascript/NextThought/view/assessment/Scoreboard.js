Ext.define('NextThought.view.assessment.Scoreboard',{
	extend: 'NextThought.view.assessment.Panel',
	alias: 'widget.assessment-scoreboard',
	requires: [
		'NextThought.view.assessment.Score',
		'NextThought.view.assessment.ScoreboardHeader',
		'NextThought.view.assessment.ScoreboardTally'
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
		{ xtype: 'button', text: 'I can do better!', ui: 'secondary', scale: 'large' }
	],


	initComponent: function(){
		this.callParent(arguments);
		this.hide();//we have to pre-render then hide. We hide until after grading, or preset the previously taken quiz.
	},


	afterRender: function(){
		this.callParent(arguments);
	}
});
