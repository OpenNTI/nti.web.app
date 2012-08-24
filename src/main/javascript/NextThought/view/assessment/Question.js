Ext.define('NextThought.view.assessment.Question',{
	extend: 'NextThought.view.assessment.Panel',
	alias: 'widget.assessment-question',

	requires: [
		'NextThought.view.assessment.Header',
		'NextThought.view.assessment.Parts'
	],

	cls: 'question',

	dockedItems: [
		{ dock: 'top', xtype: 'question-header'},
		{ dock: 'bottom', xtype: 'question-parts'}
	],


	removeContent: function(selector){
		var el = Ext.get(this.contentElement);
		el.select(selector).remove();
	},


	initComponent: function(){
		this.callParent(arguments);
		//TODO: this is a shortcut, assuming there is only one part to the question.
		var part = this.questionPart = this.question.get('parts').first();

		//TODO: addDockedItem instead?
		this.down('question-parts').setQuestionAndPart(
				this.question,
				part,
				0,
				this.questionSet,
				this.canSubmitIndividually(),
				this.tabIndexTracker);

		if( this.questionSet ){
			this.mon(this.questionSet,{
				scope: this,
				'beforesubmit':this.gatherQuestionResponse,
				'graded':this.updateWithResults,
				'reset':this.reset
			});
		}

		this.setQuestionContent();
		this.setupContentElement();
	},


	updateWithResults: function(assessedQuestionSet){
		var q, id = this.question.getId();

		Ext.each(assessedQuestionSet.get('questions'),function(i){
			if(i.getId()===id){ q = i; return false; }
//			console.log(i.raw);
		});

		if(!q){ Ext.Error.raise('Couldn\'t find my question? :('); }

		this[q.isCorrect()?'markCorrect':'markIncorrect']();
	},

	gatherQuestionResponse: function(questionSet,collection){
		var id =  this.question.getId(), values = [];
		Ext.each(this.query('abstract-question-input'),function(p){
			p.setSubmitted();
			values[p.getOrdinal()] = p.getValue();
		});

		if(collection.hasOwnProperty(id)){
			console.error('duplicate id in submission!',id);
			return false;
		}

		collection[id] = values;
	},


	canSubmitIndividually: function(){
		var c = this.contentElement;
		function resolve(){
			var el = Ext.get(c).down('param[name=canindividual]');
			return !el || el.getValue() !== 'false';
		}
		//don't dig into the dom if we already have an answer
		if(this.questionSet){
			return false;
		}

		return !c || resolve();
	},


	setQuestionContent: function(){
		var root = LocationProvider.getContentRoot(),c;
		function fixRef(original,attr,url) {
			return (/^data:/i.test(url)||Globals.HOST_PREFIX_PATTERN.test(url))
					? original
					: attr+'="'+root+url+'"'; }

		c = this.question.get('content') || '';
		//don't append a break unless there is actual content
		if(c.replace(/<.*?>|\s+/g,'')){
			c += '<br/>';
		}

		this.update((c + this.questionPart.get('content')).replace(/(src)="(.*?)"/igm, fixRef));
		this.updateLayout();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getTargetEl().select('img').on('load',function(){
			this.updateLayout();
			this.syncElementHeight();
		},this,{single:true});
		this.syncTop();
	},


	markCorrect: function(){
		this.down('question-header').markCorrect();
		this.down('question-parts').markCorrect();
	},


	markIncorrect: function(){
		this.down('question-header').markIncorrect();
		this.down('question-parts').markIncorrect();
	},


	reset: function(){
		this.down('question-header').reset();
		this.down('question-parts').reset();
	}
});
