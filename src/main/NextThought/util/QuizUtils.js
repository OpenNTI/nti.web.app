Ext.define('NextThought.util.QuizUtils', {
	requires: [
		'NextThought.util.ParseUtils'
	],
	alternateClassName: 'QuizUtils',
	statics: {

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
				ntiid = Ext.query('meta[name=NTIID]')[0].getAttribute('content'),
				url = _AppConfig.service.getQuizSubmitURL(ntiid),
				problems,
				data = {},
				vp = VIEWPORT.getEl();

			function iter(id,v){
				data[id] = v.getValue();
				v.hide();
			}

			vp.mask('Grading...');

			problems = me.getProblemElementMap(iter,me);

			Ext.Ajax.request({
				url: url,
				jsonData: Ext.JSON.encode(data),
				method: 'POST',
				scope: me,
				callback: function(){ vp.unmask(); },
				failure: function(){
					//TODO: hook up to error handling
					console.error('FAIL', arguments);
				},
				success: function(r){
					var quizResults = ParseUtils.parseItems([ Ext.JSON.decode(r.responseText) ]);
					me.showQuizResult(quizResults[0], problems);
				}
			});
		},


		showQuizResult: function(quizResult, problemsElementMap) {
			var mathCls = 'mathjax tex2jax_process ',
				ntiid = Ext.query('meta[name=NTIID]')[0].getAttribute('content'),
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
		},

		navigateToHint: function(href) {
			var bookInfo = Library.findLocation('tag:nextthought.com,2011-07-14:AOPS-HTML-prealgebra-3'),
					book = bookInfo.book;

			VIEWPORT.fireEvent('navigate', book, book.get('root')+href);
		}

	}
},
		function(){
			window.QuizUtils = this;
		}
);


/*********************************************************
 * Global functions called by content in the Reader panel
 */

function NTIHintNavigation(href) {
	QuizUtils.navigateToHint(href);
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
