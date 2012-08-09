Ext.define('NextThought.view.assessment.Response',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.question-response',

	requires: [
		'NextThought.view.assessment.input.SymbolicMath'//...add all the possible input types here
	],

	plain: true,
	cls: 'response',
	ui: 'assessment',


	setQuestionAndPart: function(question,part){
		this.removeAll(true);
		var type = 'question-input-'+part.get('Class').toLowerCase();
		this.add({xtype: type, question: question, part: part});
	},


	markCorrect: function(){
		this.down('abstract-question-input').markCorrect();
	},

	markIncorrect: function(){
		this.down('abstract-question-input').markIncorrect();
	},

	reset: function(){
		this.down('abstract-question-input').reset();
	}
});
