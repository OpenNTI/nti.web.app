Ext.define('NextThought.view.content.reader.Assessment', {

	requires: [
		'NextThought.view.assessment.Scoreboard',
		'NextThought.view.assessment.Question',
		'NextThought.view.assessment.QuizSubmission'
	],

	uses: [
		'NextThought.view.content.reader.ComponentOverlay'
	],

	constructor: function(){},

	makeAssessmentQuestion: function(q,set){
		var contentElement = this.getContentElement('object','data-ntiid', q.getId());

		//CUTZ override getVideos to pull things from the dom for now.
		//The model expects the videos in the assessment json which doesn't
		//sound like its going to happen anytime soon.
		q.getVideos = Ext.bind(DomUtils.getVideosFromDom,q,[contentElement]);

		this.activeOverlayedPanels[q.getId()] = Ext.widget('assessment-question',{
			reader: this,
			question: q,
			renderTo: this.componentOverlayEl,
			questionSet: set || null,
			tabIndexTracker: this.overlayedPanelTabIndexer,
			contentElement: contentElement
		});
	},


	makeAssessmentQuiz: function(set){
		var me = this,
			c = me.componentOverlayEl,
			guid = guidGenerator(),
			questions = set.get('questions');

		me.activeOverlayedPanels[guid+'scoreboard'] = Ext.widget('assessment-scoreboard',{
			reader: me, renderTo: c, questionSet: set,
			tabIndexTracker: this.overlayedPanelTabIndexer
		});

		me.activeOverlayedPanels[guid+'submission'] = Ext.widget('assessment-quiz-submission',{
			reader: me, renderTo: c, questionSet: set,
			tabIndexTracker: this.overlayedPanelTabIndexer
		});

		Ext.each(questions,function(q){me.makeAssessmentQuestion(q,set);});

	},


	injectAssessments: function(items){
		var me = this,
			slice = Array.prototype.slice,
			questionObjs;

		me.clearOverlayedPanels();

		//nothing to do.
		if(!items || items.length < 1){
			return;
		}

		new Ext.dom.CompositeElement(
			this.getDocumentElement().querySelectorAll('.x-btn-submit,[onclick^=NTISubmitAnswers]')).remove();

		questionObjs = slice.call(this.getDocumentElement().querySelectorAll('object[type$=naquestion][data-ntiid]'));

		Ext.Array.sort(items, function(ar,br){
			var a = questionObjs.indexOf(me.getRelatedElement(ar.get('NTIID'), questionObjs)),
				b = questionObjs.indexOf(me.getRelatedElement(br.get('NTIID'), questionObjs));
			return ( ( a === b ) ? 0 : ( ( a > b ) ? 1 : -1 ) );
		});

		Ext.each(this.cleanQuestionsThatAreInQuestionSets(items, questionObjs),function(q){
			if(q.isSet){ me.makeAssessmentQuiz(q); }
			else { me.makeAssessmentQuestion(q); }
		});
	},


	cleanQuestionsThatAreInQuestionSets: function(items, objects){
		var result = [], questionsInSets = [], push = Array.prototype.push, sets = {}, usedQuestions = {};

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
				if (objects[i] && typeof objects[i] !== 'string') {
					objects[i] = objects[i].getAttribute('data-ntiid');
				}
				if (objects[i] === id) { return true; }
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
	}

});
