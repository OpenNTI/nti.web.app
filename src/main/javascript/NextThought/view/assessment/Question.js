Ext.define('NextThought.view.assessment.Question',{
	extend: 'NextThought.view.assessment.Panel',
	alias: 'widget.assessment-question',

	requires: [
		'NextThought.view.assessment.Header',
		'NextThought.view.assessment.Response'
	],

	cls: 'question',

	dockedItems: [
		{ dock: 'top', xtype: 'question-header'},
		{ dock: 'bottom', xtype: 'question-response'}
	],


	removeContent: function(selector){
		var el = Ext.get(this.contentElement);
		el.select(selector).remove();
	},


	initComponent: function(){
		this.callParent(arguments);
		//TODO: this is a shortcut, assuming there is only one part to the question.
		var part = this.questionPart = this.question.get('parts').first();
		this.down('question-response').setQuestionAndPart(
				this.question,
				part,
				0,
				this.questionSet,
				this.canSubmitIndividually());

		if( this.questionSet ){
			this.mon(this.questionSet,'beforesubmit',this.gatherQuestionResponse,this);
		}

		this.setQuestionContent();
		this.setupContentElement();
	},


	gatherQuestionResponse: function(questionSet,collection){
		var id =  this.question.getId(), values = [];
		Ext.each(this.query('abstract-question-input'),function(p){
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
		return this.questionSet || !c || resolve();
	},


	setQuestionContent: function(){
		var root = LocationProvider.getContentRoot(),c;
		function fixRef(original,attr,url) {
			return (/^data:/i.test(url)) ? original : attr+'="'+root+url+'"'; }

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
		this.down('question-response').markCorrect();
	},


	markIncorrect: function(){
		this.down('question-header').markIncorrect();
		this.down('question-response').markIncorrect();
	},


	reset: function(){
		this.down('question-header').reset();
		this.down('question-response').reset();
	}
});
