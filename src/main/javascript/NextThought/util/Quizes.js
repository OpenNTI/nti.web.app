Ext.define('NextThought.util.Quizes', {
	singleton: true,
	requires: [
		'NextThought.ContentAPIRegistry',
		'NextThought.util.Parsing',
		'NextThought.providers.Location',
		'NextThought.view.math.Window'
	],

	idToVar: {},

	sendLaTeXCommand: function(mq, tex, root) {
		root = root || Ext.getCmp('library').down('reader-panel').getDocumentElement();
		var w = root.parentWindow;

		if (mq) {
			mq = w.$(mq);

			if(!mq.is('.quiz-input')) {
				mq = mq.parents('.quiz-input');
			}

			//write the latex, then refocus since it's probably been lost...
			mq.mathquill('write', tex);
			mq.trigger('focus');
			mq.trigger('focusin');
		}
	},


	contentScrollHandler: function(){
		Ext.Object.each(this.idToVar, function(key, vars){
			vars.win.hide();
			clearTimeout(vars.scrollTimeout);
			vars.scrollTimeout = setTimeout( function(){if (vars.win){vars.win.show();}}, 200 );
		});
	},


	setupQuiz: function(doc, reader){
		try{
			var me = this,
				inputs = doc.querySelectorAll('input[type=number]'),
				quiz = inputs.length>0,
				w = doc.parentWindow,
				q;

			if(!w.$ || !w.$.fn.mathquill){
				setTimeout(function(){me.setupQuiz(doc, reader);},50);
				return;
			}

			if(!quiz){
				return;
			}


			if (!me.hookedScrollUp){
				me.hookedScrollUp = true;
				reader.registerScrollHandler(me.contentScrollHandler, me);
			}

			//the frame has jQuery & MathQuill
			w.$('input[type=number]').replaceWith(function(){
				var id = w.$(this).attr('id');
				return '<input id="'+id+'" type="hidden"/><span class="quiz-input"></span>';
			});

			q = w.$('span.quiz-input').mathquill('editable');

			//Add events for the math panel
			this.attachMathSymbolToMathquillObjects(q);
		}
		catch(e){
			console.error('unable to setup quiz ',e.stack||e.toString());
		}
	},


	getBoundingRect: function(c){
		var cmp = Ext.fly(c),
			xy = cmp.getXY(),
			h = cmp.getHeight(),
			w = cmp.getWidth();

		return {
			top: xy[1],
			bottom: xy[1] + h,
			left: xy[0],
			right: xy[0] + w,
			height: h,
			width: w
		};
	},


	attachMathSymbolToMathquillObjects: function(objectOrObjects) {
		var me = this,
			r = Ext.getCmp('library').down('reader-panel');

		function getVars(ctx){
			var id = Ext.get(ctx).id,
			vars = me.idToVar[id] || {};
			me.idToVar[id] = vars;
			return vars;
		}

		function cleanVars(ctx) {
			var id = Ext.get(ctx).id;
			delete me.idToVar[id];
		}

		objectOrObjects.bind('mousedown click focusin', function(e){
			var ctx = this,
				vars = getVars(ctx);

			clearTimeout(vars.closeTimeout);

			r.scrollToNode(this, true, 90);
			if (!vars.win){
				vars.win = Ext.widget({xtype: 'math-symbol-window', target: ctx, posFn: function(){
					var rect = me.getBoundingRect(ctx);
					rect.left += 4; //adjust to center
					rect.right += 4;
					return r.convertRectToScreen(rect);
					}
				});
			}
			setTimeout(function(){vars.win.show();}, 10);
		});

		objectOrObjects.bind('focusout blur', function(e){
			var ctx = this,
				vars = getVars(ctx);


			vars.closeTimeout = setTimeout(function(){
				clearTimeout(vars.scrollTimeout);
				if (vars.win) {
					vars.win.close();
					cleanVars(ctx);
				}
			},
			200);
		});

	},


	hideMathQuillValues: function(doc){
		doc.parentWindow.$('span.quiz-input').hide();
	},



	pullMathQuillValues: function(doc){
		var w = doc.parentWindow,
			inputs = doc.querySelectorAll('span.quiz-input'),
			i = inputs.length-1,
			o,latex;

		for(;i>=0;i--){
			o = inputs[i];
			latex = w.$(o).mathquill('latex');
			o.previousSibling.value = latex;
		}
	},


	/**
	 *
	 * @param iterationCallback Optional - a function that takes three arguments: function(id, inputEl, containerEl)
	 */
	getProblemElementMap: function(doc,iterationCallback,scope){
		var problems = {};
		 Ext.each(
			Ext.query('.question input',doc),
			function(v){
				var id = v.getAttribute('id'),
					el = Ext.get(v);

				el.setVisibilityMode(Ext.Element.DISPLAY);
			        problems[id] = el.up('.question').down('.problem');

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

		//ask the symbol panel to go away (does nothing if it's not up)
		MathSymbolPanel.hideMathSymbolPanel();

		function populateQuestionResponses(id,v){
			var items = quizResult.get('Items') || [];

			items.push(Ext.create('NextThought.model.QuizQuestionResponse', {
				ID: id,
				Question: Ext.create('NextThought.model.QuizQuestion', {ID: id}),
				Response: v.getValue()
			}));
			quizResult.set('Items', items);
		}


		me.pullMathQuillValues(doc);

		me.getProblemElementMap(doc,populateQuestionResponses,me);

		vp.mask('Grading...');

		quizResult.save({
			scope: this,
			success:function(gradedResults){
				me.showQuizResult(doc,gradedResults, problems);
				vp.unmask();
			},
			failure:function(){
				//TODO: hook up to error handling
				console.error('FAIL', arguments);
				vp.unmask();
				alert('There was a problem grading your quiz');
			}
		});
	},


	showQuizResult: function(doc,quizResult, problemsElementMap) {
		var mathCls = 'mathjax tex2jax_process ',
			ntiid = LocationProvider.currentNTIID,
			problems = problemsElementMap || this.getProblemElementMap(doc);

		this.resetQuiz(doc);
		this.hideMathQuillValues(doc);

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
			        r = p.parent().next('.result');

				r.removeCls('hidden');

			        r.createChild({
				    tag: 'span',
				    cls: 'result'
			        });
			        s = r.down('.result');

			    if (qqr.get('Response') !== '')
			    {
			        s.addCls((qqr.get('Assessment')?'':'in')+'correct');
			        s.createChild({
				    tag: 'span',
				    cls: 'rightwrongbox-inverse ' + (qqr.get('Assessment')?'rightbox':'wrongbox') + '-inverted'
			        });

				s.createChild({
					tag : 'span',
					html: '"\\('+qqr.get('Response')+'\\)" is ' + (qqr.get('Assessment')?'':'in')+'correct',
					cls: mathCls+'response' + ' answer-text'
				});

			        if (! qqr.get('Assessment')){
			            r.createChild({
				        tag : 'a',
				        html : 'Why?',
				        cls: 'why',
				        href: '#',
					onclick: "var state=$(this).hasClass('bubble');$('a.why').removeClass('bubble');if (!state) {$(this).addClass('bubble');}",
				        cn: { tag: 'span', cls: 'bubble'}
			            });
 
			            s = r.down('span.bubble');
			            s.createChild({
				        tag: 'span',
				        html: 'Solution',
				        cls: 'bubble-title'
			            });

				    s.createChild({
					tag : 'span',
					html: q.get('Answers').join(', ').replace(/\$(.+?)\$/ig,'\\($1\\)'),
					cls: mathCls+'bubble-text'
				    });
				}
			    }
			    else
			    {
				s.addCls('noanswer');

				s.createChild({
				    tag : 'span',
				    html: 'Question not answered.',
				    cls: mathCls+'response' + ' answer-text'
				});
				
			    }
			});

		doc.parentWindow.postMessage('MathJax.reRender()',location.href);

		Ext.get(doc.getElementById('submit')).update('Reset');
		this.scrollUp();
	},

	resetQuiz: function(doc) {
		var w = doc.parentWindow;
		Ext.get(doc.getElementById('submit')).update('Submit');

		this.getProblemElementMap(doc,
			function(id,v,c){
				v.dom.value='';
				w.$('span.quiz-input').replaceWith('<span class="quiz-input"></span>');
				w.$('span.quiz-input').mathquill('editable');

				this.attachMathSymbolToMathquillObjects(w.$('span.quiz-input'));

			    var r = c.parent().next('.result'),
					resp, ans;

				r.addCls('hidden');
				r.removeCls(['correct','incorrect']);

				resp = r.down('span.result');
				ans = r.down('a.why');

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
