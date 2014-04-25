Ext.define('NextThought.view.assessment.input.SymbolicMath', {
	extend: 'NextThought.view.assessment.input.FreeResponse',

	requires: [
		'NextThought.view.menus.SymbolicMathMenuItem'
	],

	alias: 'widget.question-input-symbolicmathpart',

	spanTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'tabable'}).compile(),

	toolbarTpl: Ext.DomHelper.markup([
		{ cls: 'mathsymbol sqrt', 'data-latex': '\\\\surd', 'data-qtip': '{{{NextThought.view.assessment.input.SymbolicMath.insert-sqrt}}}' },
		{ cls: 'mathsymbol square', 'data-latex': 'x^2', 'data-qtip': '{{{NextThought.view.assessment.input.SymbolicMath.insert-sqr}}}' },
		{ cls: 'mathsymbol parens', 'data-latex': '(x)', 'data-qtip': '{{{NextThought.view.assessment.input.SymbolicMath.insert-paren}}}'},
		{ cls: 'mathsymbol approx', 'data-latex': '\\\\approx', 'data-qtip': '{{{NextThought.view.assessment.input.SymbolicMath.insert-approx}}}' },
		{ cls: 'mathsymbol pi', 'data-latex': '\\\\pi', 'data-qtip': '{{{NextThought.view.assessment.input.SymbolicMath.insert-pi}}}' }
	]),


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.getEl().select('.mathsymbol'), {
			scope: this,
			click: this.mathSymbolClicked
		});

		var s = this.mathquillSpan = this.spanTpl.insertAfter(this.inputField);

		jQuery(s).mathquill('editable');



		Ext.fly(s).set({'data-label': this.part.get('answerLabel')});

		s.focus = function() {
			if (this.focusing) {return;}
			this.focusing = true;
			jQuery(this).focus();
			delete this.focusing;
		};

		this.attachKeyListeners(s);

		this.inputField.hide().removeCls('tabable');
	},

	//don't let the base class's function run, we're using pure CSS for this version
	setupAnswerLabel: Ext.emptyFn,

	updateSubmission: function() {
		console.log('keypress', 'disable?', !this.getValue());
		if (!this.getValue()) {
			this.disableSubmission();
		}
		else {
			console.log('enable something');
			this.enableSubmission();
		}
	},

	attachKeyListeners: function(span) {
		var s = span || this.mathquillSpan,
			me = this,
			r = jQuery(s),
			timer;

		//bind on kepress so we can adjust size:
		r.bind('keyup.mathquill', function(e) {
			//if enter:
			if (e.which === 13) { //enter
				me.submitOrTabNext(s);
			}
			/*else if(e.which === 32){ //space

				//Uncommenting this could allow a space to be typed but that is really only
				//useful in text blocks which we sort of abstract away.  Part of a fix for supporting
				//inputting labels

				//jQuery(me.mathquillSpan).mathquill('write', '\\space ');
				//me.mathquillSpan.focus();
			}*/

			clearTimeout(timer);
			timer = setTimeout(function() {
				me.adjustSize();
				me.updateSubmission();
			}, 100);

		}).bind('paste', function(e) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
	},


	adjustSize: function() {
		var currentHeight = this.inputBox.getHeight();

		if (currentHeight !== this.lastHeight) {
			this.updateLayout();
		}

		this.lastHeight = currentHeight;
	},

	updateSolutionButton: function() {
		var solutions, solutionNode, ab, orNode;
		this.callParent(arguments);
		if (!this.submitted) {
			return;
		}

		ab = this.solutionAnswerBox;
		ab.update('');

		solutions = this.part.get('solutions');
		Ext.each(solutions, function(s, idx) {
			solutionNode = document.createElement('span');
			ab.appendChild(solutionNode);
			solutionNode.innerHTML = s.get('value');
			jQuery(solutionNode).mathquill();

			if (idx < solutions.length - 1) {
				ab.appendChild(document.createElement('br'));
				//WTF extjs why cant I just create and append a textnode
				orNode = document.createElement('span');
				orNode.innerHTML = ' or: ';
				ab.appendChild(orNode);
			}
		});
	},

	mathSymbolClicked: function(e) {
		if (this.submitted) {return;}
		var t = e.getTarget();
		jQuery(this.mathquillSpan).mathquill('write', t.getAttribute('data-latex'));
		this.mathquillSpan.focus();
		this.updateSubmission();
	},

	getPreviousMenuItemType: function() {
		return 'symbolicmath-menuitem';
	},

	getValue: function() {
		var v = jQuery(this.mathquillSpan).mathquill('latex') || '';
		v = this.self.sanitizeMathquillOutput(v);

		//console.log('Got value', v);

		return v;
	},

	sanitizeForMathquill: function(latex) {
		return this.self.transformToMathquillInput(latex);
	},

	setValue: function(latex) {
		latex = this.sanitizeForMathquill(latex);
		console.log('Setting value to ', latex);
		jQuery(this.mathquillSpan).mathquill('latex', latex);
		this.adjustSize();
	},


	reset: function() {
		this.callParent(arguments);
		this.setValue('');
		jQuery(this.mathquillSpan).mathquill('revert').mathquill('editable');
		this.attachKeyListeners();
	},


	markCorrect: function() {
		this.callParent(arguments);
		this.disableMathquillEditable();
	},


	markIncorrect: function() {
		this.callParent(arguments);
		this.disableMathquillEditable();
	},

	disableMathquillEditable: function() {
		console.log('disabling');
		var latex = this.getValue();
		jQuery(this.mathquillSpan).mathquill('revert').html(latex).mathquill();
	},

	focus: function() {
		this.mathquillSpan.focus();
	},

	checkit: function() {
		//Mathquil dies a horrible death (crashes the browser) in certain cases
		//if we don't do a mouseup here.  Without this fix (hack?) selecting some text
		//and while the mouse is down triggering a submission with enter causes the browser
		//to hang if the mouse is moved again.  Something about the mathquil mousemove handlers
		//does terrible things.
		jQuery(this.mathquillSpan).mouseup();
		this.callParent(arguments);
	}

}, function() {
	this.transformToMathquillInput = function(latex) {
		//Mathquill will produce latex it can't consume.
		//Specifically we see issues arround the spacing
		//comands \; \: and \,. We could probably patch this
		//particular issue with a small change in mathquills
		//symbol.js and cursor.js but for now this seems
		//safest and fastest
		//console.log('Sanitizing raw value', latex);

		latex = latex.trim();
		latex = latex.replace(/\s/g, '\\space ');
		latex = latex.replace(/\\[;:,]/g, '\\space ');
		//console.log('Sanitized value is ', latex);


		//OK so the old version of mathquil doesn't like space
		//so lets fact it out with quad, things will have huge
		//spaces but it should mostly work
		//latex = latex.replace(/\\space/g, '\\quad');

		return latex;
	};

	this.sanitizeMathquillOutput = function(v) {
		//console.log('Got raw value', v);
		v = v.trim();
		//v = v.replace(/\\quad/g, '\\space');
		v = v.replace(/\\[;:,]/g, '\\space ');
		v = v.replace(/\\space /g, ' ');
		v = v.replace(/\s+/g, ' ');

		//console.log('Got clean value', v);

		return v;
	};
});
