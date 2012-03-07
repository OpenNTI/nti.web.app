Ext.define('NextThought.util.QuizUtils', {
	singleton: true,
	requires: [
		'NextThought.ContentAPIRegistry',
		'NextThought.util.ParseUtils',
		'NextThought.providers.Location'
	],
	alternateClassName: 'QuizUtils',

	/**
	 *
	 * @param iterationCallback Optional - a function that takes three arguments: function(id, inputEl, containerEl)
	 */
	getProblemElementMap: function(doc,iterationCallback,scope){
		var problems = {};
		 Ext.each(
			Ext.query('.worksheet-problems input',doc),
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

	submitAnswers: function(doc){
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

		me.getProblemElementMap(doc,populateQuestionResponses,me);

		vp.mask('Grading...');

		quizResult.save({
			scope: this,
			success:function(gradedResults,operation){
				me.showQuizResult(doc,gradedResults, problems);
				vp.unmask();
			},
			failure:function(){
				//TODO: hook up to error handling
				console.error('FAIL', arguments);
				vp.unmask();
			}
		});
	},


	showQuizResult: function(doc,quizResult, problemsElementMap) {
		var mathCls = 'mathjax tex2jax_process ',
			ntiid = LocationProvider.currentNTIID,
			problems = problemsElementMap || this.getProblemElementMap(doc);

		this.resetQuiz(doc);

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

		doc.ownerWindow.postMessage('MathJax.reRender()',location.href);

		Ext.get(doc.getElementById('submit')).update('Reset');
		this.scrollUp();
	},

	resetQuiz: function(doc) {
		Ext.get(doc.getElementById('submit')).update('Submit');

		this.getProblemElementMap(doc,
			function(id,v,c){
				v.dom.value='';
				var r = c.next('.result'),
					resp, ans;

				r.addCls('hidden');
				r.removeCls(['correct','incorrect']);

				resp = r.down('.response');
				ans = r.down('.answer');

				if (resp){resp.remove();}
				if (ans){ans.remove();}

				v.show();
			},
			this);

		this.scrollUp();
	},


	scrollUp: function(){
		var p = Ext.getCmp('readerPanel');
		p.relayout();
		p.scrollTo(0);
	},


	submitAnswersHandler: function(e){
		e = Ext.EventObject.setEvent(e||event);
		e.stopPropagation();
		e.preventDefault();

		var doc = e.getTarget().ownerDocument;

		if (!/submit/i.test(e.getTarget().innerHTML)){
			this.resetQuiz(doc);
			return false;
		}

		this.submitAnswers(doc);
		return false;
	}


}, function(){
	window.QuizUtils = this;
	ContentAPIRegistry.register('NTIHintNavigation',LocationProvider.setLocation,LocationProvider);
	ContentAPIRegistry.register('NTISubmitAnswers',this.submitAnswersHandler,this);
	ContentAPIRegistry.register('togglehint',function(e) {
		e = Ext.EventObject.setEvent(e||event);
		Ext.get(e.getTarget().nextSibling).toggleCls("hidden");
		return false;
	});
});
