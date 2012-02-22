Ext.define('NextThought.util.QuizUtils', {
	singleton: true,
	requires: [
		'NextThought.util.ParseUtils',
		'NextThought.providers.Location'
	],
	alternateClassName: 'QuizUtils',

	/**
	 *
	 * @param iterationCallback Optional - a function that takes three arguments: function(id, inputEl, containerEl)
	 */
	getProblemElementMap: function(iterationCallback,scope){
		var problems = {};
		 Ext.each(
			Ext.query('.worksheet-problems input'),
			function(v){
				var id = v.getAttribute('id'),
					el = Ext.get(v);

				el.setVisibilityMode(Ext.Element.DISPLAY);
				problems[id] = el.up('.problem');

				if(iterationCallback){
					iterationCallback.call(scope||window, id, el, problems[id]);
				}
			},
			this);

		return problems;
	},

	submitAnswers: function(){
		var me = this,
			ntiid = LocationProvider.currentNTIID,
			problems,
			vp = Ext.getBody(),
			quizResult = Ext.create('NextThought.model.QuizResult' ,{ContainerId: ntiid});

		function populateQuestionResponses(id,v){
			var items = quizResult.get('Items') || [];

			items.push(Ext.create('NextThought.model.QuizQuestionResponse', {
				ID: id,
				Question: Ext.create('NextThought.model.QuizQuestion', {ID: id}),
				Response: v.getValue()
			}));
			quizResult.set('Items', items);
		}

		me.getProblemElementMap(populateQuestionResponses,me);

		vp.mask('Grading...');

		quizResult.save({
			scope: this,
			success:function(gradedResults,operation){
				me.showQuizResult(gradedResults, problems);
				vp.unmask();
			},
			failure:function(){
				//TODO: hook up to error handling
				console.error('FAIL', arguments);
				vp.unmask();
			}
		});
	},


	showQuizResult: function(quizResult, problemsElementMap) {
		var mathCls = 'mathjax tex2jax_process ',
			ntiid = LocationProvider.currentNTIID,
			problems = problemsElementMap || this.getProblemElementMap();

		if(ntiid !== quizResult.get('ContainerId')){
			Ext.Error.raise('Result does not match the page!');
		}

		Ext.each(
			quizResult.get('Items'),
			function(qqr){
				var q,p,r,id;
				q = qqr.get('Question');
				id = q.get('ID');
				p = problems[id];
				r = p.next('.result');

				r.removeCls('hidden');
				r.addCls((qqr.get('Assessment')?'':'in')+'correct');

				r.createChild({
					tag : 'div',
					html: 'Your response: \\('+qqr.get('Response')+'\\)',
					cls: mathCls+'response'
				});

				r.createChild({
					tag : 'div',
					html: 'Correct answer(s): '+q.get('Answers').join(', ').replace(/\$(.+?)\$/ig,'\\($1\\)'),
					cls: mathCls+'answer'
				});
			});

		try {
			MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
		}
		catch(e){
			console.warn('No MathJax? ',e);
		}

		this.scrollUp();

		Ext.get('submit').update('Reset');
	},

	resetQuiz: function() {
		Ext.get('submit').update('Submit');

		this.getProblemElementMap(
			function(id,v,c){
				v.dom.value='';
				var r = c.next('.result');

				r.addCls('hidden');
				r.removeCls(['correct','incorrect']);

				r.down('.response').remove();
				r.down('.answer').remove();

				v.show();
			},
			this);

		this.scrollUp();
	},


	scrollUp: function(){
		var p = Ext.getCmp('readerPanel');
		p.relayout();
		p.scrollTo(0);
	}

}, function(){
	window.QuizUtils = this;
});


/*********************************************************
 * Global functions called by content in the Reader panel
 */

function NTIHintNavigation(ntiid) {
	LocationProvider.setLocation(ntiid);
}

function NTISubmitAnswers(){
	if (!/submit/i.test(Ext.get('submit').dom.innerHTML)){
		QuizUtils.resetQuiz();
		return;
	}

	QuizUtils.submitAnswers();
}


function togglehint(event) {
	Ext.get(event.target.nextSibling).toggleCls("hidden");
	return false;
}
