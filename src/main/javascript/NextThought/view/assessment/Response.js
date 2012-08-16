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


	setQuestionAndPart: function(question,part,questionSet){
		var type = 'question-input-'+part.get('Class').toLowerCase();
		this.removeAll(true);

		this[questionSet?'addCls':'removeCls']('part-of-set');

		try {
			this.add({xtype: type, question: question, part: part, questionSet: questionSet});
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
