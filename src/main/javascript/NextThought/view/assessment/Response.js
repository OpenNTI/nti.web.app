Ext.define('NextThought.view.assessment.Response',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.question-response',

	requires: [
		'NextThought.view.assessment.input.FreeResponse',
		'NextThought.view.assessment.input.Matching',
		'NextThought.view.assessment.input.MultipleChoice',
		'NextThought.view.assessment.input.SingleChoice',
		'NextThought.view.assessment.input.SymbolicMath'//...add all the possible input types here
	],

	plain: true,
	cls: 'response',
	ui: 'assessment',


	setQuestionAndPart: function(question,part){
		this.removeAll(true);
		var type = 'question-input-'+part.get('Class').toLowerCase();
		try {
			this.add({xtype: type, question: question, part: part});
		}
		catch(e){
			console.warn('missing question type: '+type);
		}
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
