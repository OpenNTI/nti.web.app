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

	addFreeResponseBox: function(div,part) {
		input = div.ownerDocument.createElement('input');
		input.className = 'answerblank ';
		input.setAttribute('data-ntitype','naqfreeresponse');
		input.style.marginTop = '12px';
		input.style.marginBottom = '15px';
		div.appendChild(input);
	},
	addSymmathBox: function(div,part) {
		input = div.ownerDocument.createElement('input');
		input.className = 'answerblank ';
		input.setAttribute('data-ntitype','naqsymmath');
		div.appendChild(input);
		w = div.ownerDocument.parentWindow;
		input.type = 'hidden';
		span = div.ownerDocument.createElement('span');
		span.className = 'quiz-input';
		input.parentNode.insertBefore(span,input.nextSibling);
		q = w.$(span).mathquill('editable');
		AssessmentUtils.attachMathSymbolToMathquillObjects(q);
	},
	addMultipleChoice: function(div,part) {
		doc = div.ownerDocument;
		extdiv = Ext.get(div);
		ol = extdiv.createChild({tag: 'ol', cls: 'naqchoices'});
		var i = 0;
		for (;i < part.data.choices.length; i++) {
			li = ol.createChild({tag: 'li', cls: 'naqchoice'});
			radio = li.createChild({
				tag: 'input',
				type: 'radio',
				name: div.getAttribute('name'),
				value: part.data.choices[i]
			});
			option = li.createChild({
				tag: 'p',
				html: part.data.choices[i]
			});
			option.setStyle('display','inline');
		}
	},
	addMatching: function(div,part) {
		doc = div.ownerDocument;
		extdiv = Ext.get(div);
		table = extdiv.createChild({tag: 'table'});
		var i = 0, values = [], j;
		//Remove below once we have real matching questions to work with
		tabletext = div.querySelector('img').alt.replace(/^.*?{tabular}{cc}/,'').replace(/\\end{tabular}.*?$/,'');
		rows = tabletext.split('\\\\'); //Actually just two slashes
		cells = [];
		j = 0;
		part.data.labels = [];
		part.data.values = [];
		for (;j < rows.length; j++) {
			if (rows[j].indexOf('&') >= 0) {
				part.data.labels.push(rows[j].split('&')[0]);
				part.data.values.push(rows[j].split('&')[1]);
			}
		}
		//Don't remove further
		//Create a table
		for (; i < part.data.labels.length; i++) {
			trdom = doc.createElement('tr');
			table.dom.appendChild(trdom);
			tr = Ext.get(trdom);
			tdl = tr.createChild({
				tag: 'td',
				html: part.data.labels[i]
			});
			tdl.dom.name = 'left:'+i;
			tdm = tr.createChild({
				tag: 'td',
				width: '25'
			});
			tdr = tr.createChild({
				tag: 'td',
				html: part.data.values[i]
			});
			tdr.dom.name = 'right:'+i;
			values.push(-1);
		}
		hidden = doc.createElement('span');
		hidden.className = 'hidden-data-span';
		hidden.style.display = 'none';
		hidden.innerHTML = '{"selected":0,"values":'+JSON.stringify(values)+'}';
		//Hidden element stores the current selection
		div.insertBefore(hidden,table.dom);
		//Draws connecting lines on the canvas
		function drawLine(canvas,leftTd,rightTd) {
			var getCumulativeOffset = function (obj) {
				var left, top;
				left = top = 0;
				if (obj.offsetParent) {
					do {
						left += obj.offsetLeft;
						top  += obj.offsetTop;
					} while (obj = obj.offsetParent);
				}
   				return {
					x : left,
   					y : top
  				};
			};
			var lo = getCumulativeOffset(leftTd),
				ro = getCumulativeOffset(rightTd);
			var co = getCumulativeOffset(canvas);
			ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.moveTo(lo.x - co.x + leftTd.offsetWidth, lo.y - co.y + leftTd.offsetHeight/2);
			ctx.lineTo(ro.x - co.x, ro.y - co.y + leftTd.offsetHeight / 2);
			ctx.stroke();
		}
		//Onclick methods: clicking on something on the left sets a
		//memory variable, then clicking on something on the right
		//records the relationship in values and redraws the lines
		for (j = 0; j < table.dom.childNodes.length; j++) {
			left = table.dom.childNodes[j].childNodes[0];
			right = table.dom.childNodes[j].childNodes[2];
			left.onclick = function(e){
				hiddenSpan = div.querySelector('.hidden-data-span');
				obj = JSON.parse(hiddenSpan.innerHTML);
				obj.selected = parseInt(this.name.replace(/^.*:/,''));
				hiddenSpan.innerHTML = JSON.stringify(obj);
			}
			right.onclick = function(e){
				hiddenSpan = div.querySelector('.hidden-data-span');
				obj = JSON.parse(hiddenSpan.innerHTML);
				if (obj.selected >= 0) {
					obj.values[obj.selected] = parseInt(this.name.replace(/^.*:/,''));
				}
				obj.selected = -1;
				hiddenSpan.innerHTML = JSON.stringify(obj);
				var canvas = div.querySelector('canvas');
				canvas.width = canvas.width; //Clear canvas
				k = 0;
				for (;k < obj.values.length; k++) {
					if (obj.values[k] >= 0) {
						drawLine(canvas,
								table.dom.childNodes[k].firstChild,
								table.dom.childNodes[obj.values[k]].lastChild);
					}
				}
			}
		}
		var canvas = doc.createElement('canvas');
		canvas.width = 300;
		canvas.height = 300;
		canvas.style.zIndex = -1;
		var canvasdiv = doc.createElement('div');
		canvasdiv.style.zIndex = -1;
		canvasdiv.style.position = 'absolute';
		div.insertBefore(canvasdiv,div.firstChild);
		canvasdiv.appendChild(canvas);
	},


	setupAssessment: function(doc, reader){
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
			//Get all naquestion divs
			var questions = doc.querySelectorAll('.naquestion');
			$AppConfig.service.getPageInfo(LocationProvider.currentNTIID, 
											pageInfoSuccess, 
											pageInfoFailure, this);
			//TODO: Figure out how to get pageinfo without the hints, solutions or explanation so the quizzes
			//can't be hacked by someone putting in JS breakpoints and reading everything we're doing
			function pageInfoFailure() {
				console.log('Could not load page info!');
			};
			function pageInfoSuccess(pageInfo) {
				var i = 0;
				for (;i < questions.length; i++) {
					var j = 0,
						qdiv = questions[i],
						question;
					for (;j < questions.length; j++) {
						if (qdiv.parentNode.getAttribute('data-ntiid') == 
								pageInfo.data.AssessmentItems[j].data.NTIID) break;
					}
					question = pageInfo.data.AssessmentItems[j];
					var partdivs = qdiv.querySelectorAll('.naquestionpart');
					for (j = 0; j < question.data.parts.length; j++) {
						if (partdivs.length <= j) break;
						var pdiv = partdivs[j],
							part = question.data.parts[j];
						//Stopgap measure until we find some way to pass figures or 
						//links thereto through the pageInfo or some other object; 
						// TODO: do something better
						var figure = pdiv.querySelector('.figure') || pdiv.querySelector('.tabular');
						//Another stopgap to test the matching questions
						var isMatching = figure && figure.querySelector('img').alt.indexOf('tabular') >= 0 && 
									LocationProvider.currentNTIID.indexOf('MN') >= 0;
						//Remove everything, we'll start from scratch
						while (pdiv.firstChild) {
							pdiv.removeChild(pdiv.firstChild);
						}
						Ext.get(pdiv).createChild({
							tag: 'a',
							html: part.data.content.replace(/\\\%\\/g,'%'),
							style: 'display:block',
							cls: 'mathjax tex2jax_process'
						});
						//Temporary measure to deal with unwanted outside text in question content
						/*toptext = pdiv.parentNode.firstChild;
						if (toptext.data && toptext.data.replace(/\s*$/,'') == 
											part.data.content.replace(/\x*$/,'')) {
							 toptext.data = '';
						}*/
						if (figure) { pdiv.appendChild(figure) }
						breaker = doc.createElement('div');
						breaker.style.margin = '10px';
						pdiv.appendChild(breaker);
						//Adding the question bits	
						var func = function(){
							console.log('Question type not recognized');
						}
						if (isMatching) {
							func = this.addMatching;
						}
						else if (part.data.Class == 'FreeResponsePart') { 
							func = me.addFreeResponseBox;
						}
						else if (part.data.Class == 'SymbolicMathPart') {
							func = me.addSymmathBox;
						}
						else if (part.data.Class == 'MultipleChoicePart') {
							func = this.addMultipleChoice;
						}
						func(pdiv,part) 
						pdiv.setAttribute("attempts","0");
					}
					endbreaker = doc.createElement('div');
					endbreaker.style.margin = '10px';
					qdiv.appendChild(endbreaker);
					submit = doc.createElement("a");
					submit.id=qdiv.parentNode.getAttribute('data-ntiid')+':submit';
					//TODO: don't hardcode this, and figure out a good way to 
					//have different button styles
					submit.className = LocationProvider.currentNTIID.indexOf('mathcounts.2012') >= 0 ? 
						'x-btn x-btn-submit x-btn-primary-medium x-btn-primary-medium-noicon x-btn-noicon submitbutton' : 
						'submitbutton';
					submit.onclick=function(e){ 
						window.AssessmentUtils.submitAnswersHandler(e,this.id.replace(':submit',''),me);
					};
					submit.innerHTML = 'Submit';
					qdiv.appendChild(submit);
					qdiv.style.margin = '1em';
				}
				//Attach a keydown event to the iframe that modifies the value 
				//of the textbox to something and then sets it back again. It
				//appears that the MathQuill code is triggered by the textbox
				//changing its value and standard text input sometimes fails 
				//to trigger this for some reason.
				doc.onkeydown = function(e) {
					 e.target.value += '0';
					 e.target.value = e.target.value.substring(0,e.target.value.length - 1);
				}
				doc.parentWindow.postMessage('MathJax.reRender()',location.href);
				//document.postMessage('MathJax.reRender()',location.href);
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
			if (questions[i].parentNode.getAttribute('data-ntiid') === questionId) {
				q = questions[i];
				break;
			}
		}
		if (i === questions.length) {
			console.log('Failed to find question for id ' + questionId);
			return;
		}

		me.pullMathQuillValues(doc);

		var parts = q.querySelectorAll('.naquestionpart');
		var items = [], p;
		for (p = 0; p < parts.length; p++) {
			var input = parts[p].querySelector('input');
			//TODO: support dict responses for Matching questions
			if (parts[p].querySelectorAll('canvas').length === 1) {
				data = JSON.parse(parts[p].querySelector('.hidden-data-span').innerHTML).values;
				dict = {}, i = 0;
				for (; i < data.length; i++) {
					dict[i] = data[i];
				}
				items.push(dict);
			}
			else if (input.getAttribute("type") == "radio") {
				inputs = parts[p].querySelectorAll('input');
				var i;
				for (i = 0; i < inputs.length; i++) {
					if (inputs[i].checked) break;
				}
				items.push(i);
			}
			else {
				items.push(input.value);
			}
		}
		var submission = Ext.create('NextThought.model.assessment.QuestionSubmission', {
			ContainerId: ntiid,
			questionId: questionId,
			parts: items
		});

		console.log('Sending to server',submission);
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

		console.log('Got back from server', result);
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
			s = pte.down('.answer-text');
			while (s) {
				s.remove();
				s = pte.down('.answer-text');
			}

			s = pte.createChild({
			  	tag: 'span',
			   	cls: 'result answer-text'
			});

			if (pte.down('input')) {
				Ext.getDom(pte.down('input')).value = '';
			}
				
			prefix = (typeof pt.submittedResponse !== 'string' || 
					pte.dom.className.indexOf('naqsymmathpart') >= 0)
				? ''
				: ('"' + pt.submittedResponse + '" is ');
			
			ptnull = pt.submittedResponse === '';
			if (typeof pt.submittedResponse === 'object') {
				ptnull = true;
				for (var v in pt.submittedResponse) {
					if (pt.submittedResponse[v] !== -1) ptnull = false;
				}
			}
			if (ptnull) {
				html = 'Question not answered.';
				bgcolor = 'transparent';
			}
			else if (!pt.assessedValue) {
				html = prefix + (prefix ? 'i' : 'I') + 'ncorrect';
				bgcolor = '#F88';
			}
			else if (pt.assessedValue < 1) {
				percent = Math.floor(pt.assessedValue * 100);
				html = prefix + percent + '% correct';
				bgcolor = '#FF0';
			}
			else {
				html = prefix + (prefix ? 'c' : 'C') + 'orrect';
				bgcolor = '#8F8';
			}
			styles = {
				'background-color': bgcolor,
				 'padding': '8px',
				 'border-radius': '3px',
				 'margin-left': '4px'
			}
			for (var style in styles) {
			  s.setStyle(style, styles[style]);
			}
			s.createChild({
				tag : 'span',
				html: html,
				cls: mathCls+'result' + ' answer-text'
			});
			var pageInfoSuccess = function() {
				var myi = i;
				var myquestionId = questionId;
				var mys = s;
				var amICorrect = pt.assessedValue > 0; //Consider switching to = 1
				this.call = function(e) {
					console.log(e);
					var j = 0, mydata, qpart, attempts, html = '';
					for (;j < e.data.AssessmentItems.length; j++) {
						if (e.data.AssessmentItems[j].data.NTIID == myquestionId) break;
					}
					mydata = e.data.AssessmentItems[j].data.parts[myi].data;
					qpart = mys.parent('.naquestionpart').dom;
					attempts = parseInt(qpart.getAttribute('attempts'));
					if (!amICorrect) {
						if (attempts < mydata.hints.length) {
							html = mydata.hints[attempts].data.value.replace(/\\\%\\/g,'%');
							cls = 'hint answer-text ';
						}
						else {
							html = mydata.explanation.replace(/\\\%\\/g,'%');
							cls = 'explanation answer-text ';
						}
					}
					qpart.setAttribute('attempts',''+(attempts+1));
					child = mys.parent('.naquestionpart').createChild({
						tag: 'a',
						html: html,
						cls: mathCls + cls
					});
					child.setStyle('display','block');
					child.setStyle('color','#000');
					doc.parentWindow.postMessage('MathJax.reRender()',location.href);
				}
				return this.call;
			}
			function pageInfoFailure() {}
			$AppConfig.service.getPageInfo(LocationProvider.currentNTIID, pageInfoSuccess(), pageInfoFailure, this);
		}

		doc.getElementById('submit').style.display = 'none';
	},

	resetAssessment: function(doc) {
		//TODO: Make this function relevant again or just get rid of it
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

//	ContentAPIRegistry.register('NTIHintNavigation',LocationProvider.setLocation,LocationProvider);
//	ContentAPIRegistry.register('NTISubmitAnswers',this.submitAnswersHandler,this);
//	ContentAPIRegistry.register('togglehint',function(e) {
//		e = Ext.EventObject.setEvent(e||event);
//
//		Ext.get(e.getTarget().nextSibling).toggleCls("hidden");
//		return false;
//	});
});
