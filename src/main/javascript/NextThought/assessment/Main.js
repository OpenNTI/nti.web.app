Ext.define('NextThought.assessment.Main', {
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


	setupAssessment: function(doc, reader){
		try{
			var me = this,
				inputs = doc.querySelectorAll('input'),
				quiz = inputs.length>0,
				w = doc.parentWindow,
				q;

			if(!w.$ || !w.$.fn.mathquill){
				setTimeout(function(){me.setupAssessment(doc, reader);},50);
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

			//Attach a keydown event to the iframe that modifies the value 
			//of the textbox to something and then sets it back again. It
			//appears that the MathQuill code is triggered by the textbox
			//changing its value and standard text input sometimes fails 
			//to trigger this for some reason.
			document.getElementsByTagName('iframe')[0].contentWindow.document.onkeydown = function(e) {
				 e.target.value += '0';
				 e.target.value = e.target.value.substring(0,e.target.value.length - 1);
			}
			//Substitute lists with radio buttons
			listElements = doc.querySelectorAll('.naqchoice');
			var i;
			for (i=0; i < listElements.length; i++) {
				var le = listElements[i],
					radioButton = doc.createElement("input");
				p = le.querySelector('p');
				radioButton.type = 'radio';
				radioButton.name = le.parentNode.querySelector('a').name;
				r = doc.createRange();
				r.selectNodeContents(p);
				radioButton.value = r.toString().replace(/\s*$/,'');
				p.style.display = 'inline';
				le.insertBefore(radioButton,p);
				le.insertBefore(doc.createTextNode('  '),p);
				//replacement.innerHTML = le.querySelector('p').innerHTML;
				//le.parentNode.removeChild(le);
			}
			//Substitute multiple choice with usable multiple choice
			mc = doc.querySelectorAll('.nti_resource_image');
			for (i=0; i < mc.length; i++) {
				if (mc[i].alt.indexOf('{tabular}') >= 0) {
					tabletext = mc[i].alt.replace(/^.*?{tabular}{cc}/,'').replace(/\\end{tabular}.*?$/,'');
					console.log(tabletext);
					rows = tabletext.split('\\\\'); //Actually just two slashes
					console.log(rows);
					cells = [], values = [];
					j = 0;
					for (;j < rows.length; j++) {
						if (rows[j].indexOf('&') >= 0) {
							cells.push(rows[j].split('&'));
							values.push(-1);
						}
					}
					console.log(cells);
					hidden = doc.createElement('span');
					hidden.style.display = 'none';
					hidden.innerHTML = '{"selected":0,"values":'+JSON.stringify(values)+'}';
					//mc.parentNode.insertBefore(
				}
			}
			//Add submit buttons to all questions
			questions = doc.querySelectorAll('.naquestion');
			for (i=0; i < questions.length; i++) {
				submit = doc.createElement("a");
				//submit.href='#'
				submit.id=questions[i].parentNode.getAttribute('data-ntiid')+':submit';
				submit.className = 'submitbutton';
				submit.onclick=function(e){ 
					window.AssessmentUtils.submitAnswersHandler(e,this.id.replace(':submit',''),me);
				 };
				submit.innerHTML = 'Submit';
				questions[i].appendChild(submit);
			}
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

	submitAnswer: function(doc, questionId){
		var me = this,
			ntiid = LocationProvider.currentNTIID,
			problems,
			vp = Ext.getBody();

		var questions = doc.querySelectorAll('.naquestion')
		var q, i;

		for (i = 0; i < questions.length; i++) {
			console.log(questions[i].parentNode.getAttribute('data-ntiid'),questionId);
			if (questions[i].parentNode.getAttribute('data-ntiid') === questionId) {
				q = questions[i];
				break;
			}
		}
		if (i === questions.length) {
			console.log('Failed to find question for id ' + questionId);
			return;
		}
		var parts = q.querySelectorAll('.naquestionpart');
		var items = [], p;
		for (p = 0; p < parts.length; p++) {
			var input = parts[p].querySelector('input');
			//TODO: support dict responses for Matching questions
			if (input.className.indexOf('answerblank') >= 0) {
				items.push(input.value);
			}
			else {
				inputs = parts[p].querySelectorAll('input');
				var i;
				for (i = 0; i < inputs.length; i++) {
					if (inputs[i].checked) break;
				}
				items.push(i);
			}
			/*items.push(Ext.create('NextThought.model.assessment.TextResponse', {
				value: input.value
			}));*/
		}
		var submission = Ext.create('NextThought.model.assessment.QuestionSubmission', {
			ContainerId: ntiid,
			questionId: questionId,
			parts: items
		});

		me.pullMathQuillValues(doc);

		console.log(submission);
		vp.mask('Grading...');

		submission.save({
			scope: this,
			success:function(gradedResult){
				me.showAssessmentResult(doc, gradedResult, questionId);
				vp.unmask();
			},
			failure:function(){
				//TODO: hook up to error handling
				console.error('FAIL', arguments);
				vp.unmask();
				alert('There was a problem grading your question');
			}
		});
	},


	showAssessmentResult: function(doc, result, questionId) {
		var mathCls = 'mathjax tex2jax_process ',
			ntiid = LocationProvider.currentNTIID;

		console.log(result);
		if(ntiid !== result.get('ContainerId')){
			Ext.Error.raise('Result does not match the page!');
		}

		var questions = doc.querySelectorAll('.naquestion')
		
		var question, i;

		for (i = 0; i < questions.length; i++) {
			if (questions[i].parentNode.getAttribute('data-ntiid') === questionId) {
				question = questions[i];
				break;
			}
		}

		var partElements = question.querySelectorAll('.naquestionpart');
		var parts = result.data.parts;
		console.log(partElements);	
		for (i = 0; i < parts.length; i++) {
			
			pte = Ext.get(partElements[i]);
			pt = parts[i];
			s = pte.down('.result');
			if (s) s.remove();

			s = pte.createChild({
			  	tag: 'span',
			   	cls: 'result'
			});

			Ext.getDom(pte.down('input')).value = '';

			//r = pt.data
			
			if (pt.submittedResponse === '') {
				html = 'Question not answered.';
				bgcolor = 'transparent';
			}
			else if (!pt.assessedValue) {
				html = '"'+pt.submittedResponse+'" is incorrect';
				bgcolor = '#F88';
			}
			else if (pt.assessedValue < 1) {
				percent = Math.floor(pt.assessedValue * 100);
				html = '"'+pt.submittedResponse+'" is ' + percent + '% correct';
				bgcolor = '#FF0';
			}
			else {
				html = '"'+pt.submittedResponse+'" is correct';
				bgcolor = '#8F8';
			}
			s.setStyle('background-color',bgcolor);
			s.setStyle('padding','4');
			s.createChild({
				tag : 'span',
				html: html,
				cls: mathCls+'response' + ' answer-text'
			});
		}

		doc.parentWindow.postMessage('MathJax.reRender()',location.href);

		Ext.get(doc.getElementById('submit')).update('Reset');
	},

	resetAssessment: function(doc) {
		var w = doc.parentWindow;
		doc.getElementById('submit').addClass('submitbutton');
		var sb = doc.querySelectorAll('.submitbutton'), 
			i;
		for (i = 0; i < sb.length; i++) {
			Ext.get(sb[i]).update('Submit');
			console.log('Gotten ',i);
		}

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


	submitAnswersHandler: function(e,id,me){
		e = Ext.EventObject.setEvent(e||event);
		e.stopPropagation();
		e.preventDefault();

		var doc = e.getTarget().ownerDocument;

		if (!/submit/i.test(e.getTarget().innerHTML)){
			this.resetAssessment(doc);
			return false;
		}

		this.submitAnswer(doc,id);
		return false;
	}


}, function(){
	window.AssessmentUtils = this;

	ContentAPIRegistry.register('NTIHintNavigation',LocationProvider.setLocation,LocationProvider);
	ContentAPIRegistry.register('NTISubmitAnswers',this.submitAnswersHandler,this);
	ContentAPIRegistry.register('togglehint',function(e) {
		e = Ext.EventObject.setEvent(e||event);

		Ext.get(e.getTarget().nextSibling).toggleCls("hidden");
		return false;
	});
});
