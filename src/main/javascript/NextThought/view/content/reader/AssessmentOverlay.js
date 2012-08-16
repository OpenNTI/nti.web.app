Ext.define('NextThought.view.content.reader.AssessmentOverlay', {

	requires: [
		'NextThought.view.assessment.Scoreboard',
		'NextThought.view.assessment.Question',
		'NextThought.view.assessment.QuizSubmission'
	],

	constructor: function(){
		this.on({
			scope: this,
			'content-updated': this.clearAssessments,
			'afterRender': this.insertAssessmentOverlay
		});

		this.activeAssessments = {};
	},


	insertAssessmentOverlay: function(){
		var container = Ext.DomHelper.append(this.getInsertionPoint('innerCt'), { cls:'assessment-overlay' }, true);
		this.on('destroy' , function(){ container.remove(); });
		this.assessmentOverlay = container;
	},


	clearAssessments: function(){
		var active = this.activeAssessments;
		this.activeAssessments = {};

		Ext.Object.each(active,function(k, v){
			delete active[k];
			v.destroy();
		});
	},


	makeAssessmentQuestion: function(q,set){
		this.activeAssessments[q.getId()] = Ext.widget('assessment-question',{
			reader: this,
			question: q,
			renderTo: this.assessmentOverlay,
			questionSet: set || null,
			contentElement: this.getAssessmentElement('object','data-ntiid', q.getId())
		});
	},


	makeAssessmentQuiz: function(set){
		var me = this,
			QuestionSet = Ext.ModelManager.getModel('NextThought.model.assessment.QuestionSet'),
			c = me.assessmentOverlay,
			guid = guidGenerator(),

		/// FAKE IT 'TIL YOU MAKE IT!!!
			questions = Ext.isArray(set)? set : set.get('questions');

		if(Ext.isArray(set)){
			set = new QuestionSet({questions:set});
		}
		/// FAKE IT 'TIL YOU MAKE IT!!! (end)


		me.activeAssessments[guid+'scoreboard'] = Ext.widget('assessment-scoreboard',{
			reader: me, renderTo: c, questionSet: set
		});

		me.activeAssessments[guid+'submission'] = Ext.widget('assessment-quiz-submission',{
			reader: me, renderTo: c, questionSet: set
		});

		Ext.each(questions,function(q){me.makeAssessmentQuestion(q,set);});

	},


	injectAssessments: function(items){
		var me = this;

		//nothing to do.
		if(!items || items.length < 1){
			return;
		}

		new Ext.dom.CompositeElement(
			this.getDocumentElement().querySelectorAll('.x-btn-submit,[onclick^=NTISubmitAnswers]')).remove();

		Ext.Array.sort(items, function(ar,br){
			var a = ar.getId(),
				b = br.getId();
			return ( ( a === b ) ? 0 : ( ( a > b ) ? 1 : -1 ) );
		});

		/// FAKE IT 'TIL YOU MAKE IT!!!
		me.makeAssessmentQuiz(items);

		/*
		Ext.each(items,function(q){
			if(q.isSet){ me.makeAssessmentQuiz(q); }
			else { me.makeAssessmentQuestion(q); }
		});
		*/
	},


	getAssessmentElement: function(tagName, attribute, value){
		var doc = this.getDocumentElement(),
			tags = doc.getElementsByTagName(tagName),
			i = tags.length - 1,
			vRe = new RegExp( '^'+RegExp.escape( value )+'$', 'ig');

		for(i; i >= 0; i--) {
			if(vRe.test(tags[i].getAttribute(attribute))){
				return tags[i];
			}
		}

		return null;
	}




}, function(){
	//class defined callback, this = Class

});
