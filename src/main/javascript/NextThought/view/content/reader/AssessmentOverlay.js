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


	injectAssessments: function(items){
		var me = this,
			c = this.assessmentOverlay;

		//nothing to do.
		if(!items || items.length < 1){
			return;
		}

		function makeQuestion(q,set){
			me.activeAssessments[q.getId()] = Ext.widget('assessment-question',{
				reader: me,
				question: q,
				renderTo: c,
				questionSet: set || null,
				contentElement: me.getAssessmentElement('object','data-ntiid', q.getId())
			});
		}

		function makeQuiz(set){
			var guid = guidGenerator();
			me.activeAssessments[guid+'scoreboard'] = Ext.widget('assessment-scoreboard',{
				reader: me, renderTo: c, questionSet: set
			});

			me.activeAssessments[guid+'submission'] = Ext.widget('assessment-quiz-submission',{
				reader: me, renderTo: c, questionSet: set
			});

			Ext.each(set.get('questions'),function(q){makeQuestion(q,set);});

		}

		//TODO: Remove all content based submit buttons
		new Ext.dom.CompositeElement(
			this.getDocumentElement().querySelectorAll('.x-btn-submit,[onclick^=NTISubmitAnswers]')).remove();

		Ext.Array.sort(items, function(ar,br){
			var a = ar.getId(),
				b = br.getId();
			return ( ( a === b ) ? 0 : ( ( a > b ) ? 1 : -1 ) );
		});

		Ext.each(items,function(q){
			if(q.isSet){ makeQuiz(q); }
			else { makeQuestion(q); }
		});
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
