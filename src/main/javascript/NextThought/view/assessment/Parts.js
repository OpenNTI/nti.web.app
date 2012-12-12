Ext.define('NextThought.view.assessment.Parts',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.question-parts',

	requires: [
		'NextThought.view.assessment.PartContent',
		'NextThought.view.assessment.MultiPartSubmission',
		'NextThought.view.assessment.input.Unsupported',
		'NextThought.view.assessment.input.FreeResponse',
		'NextThought.view.assessment.input.Matching',
		'NextThought.view.assessment.input.MultipleChoice',
		'NextThought.view.assessment.input.NumericMath',
		'NextThought.view.assessment.input.SingleChoice',
		'NextThought.view.assessment.input.SymbolicMath'//...add all the possible input types here
	],

	plain: true,
	cls: 'parts',
	ui: 'assessment',


	setQuestionAndPart: function(question,questionSet,individual, tabIndexTracker){
		var parts = question.get('parts'),
			multiPart = (parts.length > 1);

		this.removeAll(true);

		this[individual?'removeCls':'addCls']('part-of-set');

		if(multiPart) {
			this.setMultiPart(question, questionSet, parts, tabIndexTracker);
			if(individual){
				this.add(
					{
						xtype:'assessment-multipart-submission',
						question: question,
						tabIndexTracker: tabIndexTracker
					}
				);
			}
			return;
		}

		this.setSinglePart(question, questionSet, parts.first(), tabIndexTracker);
	},


	setSinglePart: function(question, questionSet, part, tabIndexTracker) {
		var cls = (part && part.get)? part.get('Class') : 'unsupported',
			type = 'question-input-'+cls.toLowerCase();
		try {
			this.add({
				xtype: type,
				question: question,
				part: part,
				ordinal: 0,
				questionSet: questionSet,
				tabIndexTracker: tabIndexTracker
			});
		}
		catch(e){
			console.warn('missing question type: '+type);
		}
	},


	setMultiPart: function(question, questionSet, parts, tabIndexTracker) {
		var type, part, items, i;

		this.addCls('multipart');

		for (i=0; i < parts.length; i++){
			part = parts[i];
			items = [];
			type = 'question-input-'+part.get('Class').toLowerCase();
			items.push({xtype: 'part-content', part: part, ordinal:i});
			items.push({
				xtype: type,
				question: question,
				part: part,
				ordinal: i,
				questionSet: questionSet,
				tabIndexTracker: tabIndexTracker
			});

			try {
				this.add({
					xtype: 'container',
					layout: 'auto',
					cls: 'part-container',
					items: items
				});
			}
			catch(e){
				console.warn('missing question type: '+type);
			}
		}
	},


	updateWithResults: function(assessedQuestion) {
		var parts = this.query('[question]');
		Ext.each(parts, function(part){part.updateWithResults(assessedQuestion);});
	},

	reset: function(){
		var inputs = this.query('abstract-question-input,assessment-multipart-submission');
		Ext.each(inputs, function(input){input.reset();});
	},

	afterRender: function(){
		this.callParent(arguments);
		var me = this;
		//updatelayout because sometimes this can render before other things, causing overlap
		setTimeout(function(){me.updateLayout();}, 500);
	}
});
