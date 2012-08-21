Ext.define('NextThought.view.content.reader.AssessmentOverlay', {

	requires: [
		'NextThought.util.TabIndexTracker',
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

		this.assessmentTabIndexer = new NextThought.util.TabIndexTracker();
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

		this.assessmentTabIndexer.reset(10);

		Ext.Object.each(active,function(k, v){
			v.destroy();
			delete active[k];
		});

		Ext.each(
			Ext.ComponentQuery.query('assessment-panel'),
			function(o){
				o.destroy();
			});
	},


	makeAssessmentQuestion: function(q,set){
		this.activeAssessments[q.getId()] = Ext.widget('assessment-question',{
			reader: this,
			question: q,
			renderTo: this.assessmentOverlay,
			questionSet: set || null,
			tabIndexTracker: this.assessmentTabIndexer,
			contentElement: this.getAssessmentElement('object','data-ntiid', q.getId())
		});
	},


	makeAssessmentQuiz: function(set){
		var me = this,
			QuestionSet = Ext.ModelManager.getModel('NextThought.model.assessment.QuestionSet'),
			c = me.assessmentOverlay,
			guid = guidGenerator(),
			questions = set.get('questions');

		me.activeAssessments[guid+'scoreboard'] = Ext.widget('assessment-scoreboard',{
			reader: me, renderTo: c, questionSet: set,
			tabIndexTracker: this.assessmentTabIndexer
		});

		me.activeAssessments[guid+'submission'] = Ext.widget('assessment-quiz-submission',{
			reader: me, renderTo: c, questionSet: set,
			tabIndexTracker: this.assessmentTabIndexer
		});

		Ext.each(questions,function(q){me.makeAssessmentQuestion(q,set);});

	},
	getRelatedElement: function(q) {
		var i;
		for (i = 0; i < this.questionObjs.length; i++) {
			if (!(this.questionObjs[i].getAttribute)) { continue; }
			if (this.questionObjs[i].getAttribute('data-ntiid') === q.data.NTIID) {
				return this.questionObjs[i];
			}
		}
	},

	injectAssessments: function(items){
		var me = this;

		me.clearAssessments();

		//nothing to do.
		if(!items || items.length < 1){
			return;
		}

		new Ext.dom.CompositeElement(
			this.getDocumentElement().querySelectorAll('.x-btn-submit,[onclick^=NTISubmitAnswers]')).remove();

		if (!this.hasOwnProperty('questionObjs') || this.questionObjs.length === 0 || typeof this.questionObjs[0] == 'string'){
			this.questionObjs = Array.prototype.slice.call(this.getDocumentElement().getElementsByTagName('object'));
		}
		Ext.Array.sort(items, function(ar,br){
			a = me.questionObjs.indexOf(me.getRelatedElement(ar));
			b = me.questionObjs.indexOf(me.getRelatedElement(br));
			return ( ( a === b ) ? 0 : ( ( a > b ) ? 1 : -1 ) );
		});


		Ext.each(this.cleanQuestionsThatAreInQuestionSets(items),function(q){
			if(q.isSet){ me.makeAssessmentQuiz(q); }
			else { me.makeAssessmentQuestion(q); }
		});
	},


	cleanQuestionsThatAreInQuestionSets: function(items){
		var result = [], questionsInSets = [], push = Array.prototype.push, sets = {}, usedQuestions = {},
			slice = Array.prototype.slice,
			objects = this.questionObjs;
		function inSet(id){
			var i = questionsInSets.length-1;
			for(i; i>=0; i--){
				if(id === questionsInSets[i].getId()){
					return true;
				}
			}
			return false;
		}
		function hasElement(id) {
			var i;
			for (i=0; i < objects.length; i++) {
				if (typeof objects[i] !== 'string') { objects[i] = objects[i].getAttribute('data-ntiid'); }
				if (objects[i] === id) return true;
			}
			return false;
		}

		//get sets
		Ext.each(items,function(i){if(i.isSet){ push.apply(questionsInSets, i.get('questions')); }});

		Ext.each(items,function(i){
			//work around dups
			if(i.isSet){
				if(sets[i.getId()]){return;}
				sets[i.getId()] = true;
			}
			if(i.isSet || (!inSet(i.getId()) && i.getId && !usedQuestions[i.getId()] && hasElement(i.getId()))) {
				result.push(i);
				usedQuestions[i.getId()] = true;
			}
		});

		return result;
	},

	getAssessmentElement: function(tagName, attribute, value){
		try {
		var doc = this.getDocumentElement(),
			tags = doc.getElementsByTagName(tagName),
			i = tags.length - 1,
			vRe = new RegExp( '^'+RegExp.escape( value )+'$', 'ig');

		for(i; i >= 0; i--) {
			if(vRe.test(tags[i].getAttribute(attribute))){
				return tags[i];
			}
		}
		}
		catch(er){
			console.error(er.message);
		}
		return null;
	}




}, function(){
	//class defined callback, this = Class

});
