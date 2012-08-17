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


	setQuestionAndPart: function(question,part,ordinal,questionSet,individual, tabIndexTracker){
		var type = 'question-input-'+part.get('Class').toLowerCase();
		this.removeAll(true);

		this[individual?'removeCls':'addCls']('part-of-set');

		try {
			this.add({
				xtype: type,
				question: question,
				part: part,
				ordinal: ordinal,
				questionSet: questionSet,
				tabIndexTracker: tabIndexTracker
			});
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
