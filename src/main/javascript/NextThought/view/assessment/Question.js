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
		var parts = this.question.get('parts'),
			multiPart = (parts.length > 1);

		//TODO: addDockedItem instead?
		this.down('question-parts').setQuestionAndPart(
				this.question,
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
		this.mon(this, {
			'enable-submission':this.determineSubmissionState,
			'disable-submission':this.determineSubmissionState
		});

		this.setQuestionContent(multiPart?null:parts.first());
		this.setupContentElement();
	},


	determineSubmissionState: function(){
		var d = this.query('[submissionDisabled=true]'),
			multi = this.down('assessment-multipart-submission');
		this.submissionDisabled = (d.length !== 0);

		if(multi) {
			multi[this.submissionDisabled?'disableSubmission':'enableSubmission']();
		}
	},


	updateWithResults: function(assessedQuestionSet){
		var q, id = this.question.getId();

		if(assessedQuestionSet.isSet){
			Ext.each(assessedQuestionSet.get('questions'),function(i){
				if(i.getId()===id){ q = i; return false; }
			});
		}
		else {
			q = assessedQuestionSet;
		}

		if(!q){ Ext.Error.raise('Couldn\'t find my question? :('); }

		this[q.isCorrect()?'markCorrect':'markIncorrect']();
		this.down('question-parts').updateWithResults(q);
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


	setQuestionContent: function(part){
		var root = LocationProvider.getContentRoot(), c, p;
		function fixRef(original,attr,url) {
			return (/^data:/i.test(url)||Globals.HOST_PREFIX_PATTERN.test(url))
					? original
					: attr+'="'+root+url+'"'; }

		c = this.question.get('content') || '';
		p = part ? part.get('content'): '';

		//don't append a break unless there is actual content
		if(c.replace(/<.*?>|\s+/g,'')){
			c += '<br/>';
		}

		this.update((c + p).replace(/(src)="(.*?)"/igm, fixRef));
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
		var sub = this.down('assessment-multipart-submission');
		if (sub){sub.disableSubmission();}
	},


	markIncorrect: function(){
		this.down('question-header').markIncorrect();
		var sub = this.down('assessment-multipart-submission');
		if (sub){sub.disableSubmission();}
	},


	reset: function(){
		this.down('question-header').reset();
		this.down('question-parts').reset();
		var sub = this.down('assessment-multipart-submission');
		if (sub){sub.enableSubmission();}
	},


	checkIt: function(){
		if (this.submissionDisabled){
			return;
		}

		if(this.submitted) {
			this.reset();
			delete this.submitted;
			return;
		}
		this.submitted = true;
		var coll = {};
		this.gatherQuestionResponse(null, coll);
		this.fireEvent('check-answer', this, this.question, coll[this.question.getId()]);
	}
});
