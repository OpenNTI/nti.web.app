Ext.Loader.setPath('jQuery.fn.mathquill', 'resources/lib/mathquill/mathquill.min.js');


Ext.define('NextThought.view.assessment.input.SymbolicMath',{
	extend: 'NextThought.view.assessment.input.FreeResponse',

	requires: [
		'jQuery.fn.mathquill'
	],

	alias: 'widget.question-input-symbolicmathpart',

	spanTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'tabable'}).compile(),

	toolbarTpl: Ext.DomHelper.markup([
		{ cls: 'mathsymbol sqrt', 'data-latex': '\\\\surd', title: 'Insert square root' },
		{ cls: 'mathsymbol square', 'data-latex': 'x^2', title: 'Insert squared' },
		{ cls: 'mathsymbol parens', 'data-latex': '(x)', title: 'Insert parentheses'},
		{ cls: 'mathsymbol approx', 'data-latex': '\\\\approx', title: 'Insert approximately' },
		{ cls: 'mathsymbol pi', 'data-latex': '\\\\pi', title: 'Insert pi' }
	]),


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.getEl().select('.mathsymbol'),{
			scope: this,
			click: this.mathSymbolClicked
		});

		var s = this.mathquillSpan = this.spanTpl.insertAfter(this.inputField),
			me = this,
			r = jQuery(s).mathquill('editable'),
			timer;

		s.focus = function(){
			if (this.focusing){return;}
			this.focusing = true;
			jQuery(this).focus();
			delete this.focusing;
		};

		this.attachKeyListeners(s);

		this.inputField.hide().removeCls('tabable');
	},


	attachKeyListeners: function(span){
		var s = span || this.mathquillSpan,
			me = this,
			r = jQuery(s),
			timer;

		//bind on kepress so we can adjust size:
		r.bind('keyup.mathquill', function(e){
			//if enter:
			if(e.which === 13) {
				me.submitOrTabNext(s);
			}

			clearTimeout(timer);
			timer = setTimeout(function(){
				me.adjustSize();
				console.log('keypress', 'disable?', !me.getValue());
				if(!me.getValue()){ me.disableSubmission(); }
				else { console.log('enable something');me.enableSubmission(); }
			}, 100);

		});
	},


	adjustSize: function(){
		var currentHeight = this.inputBox.getHeight();

		if (currentHeight !== this.lastHeight){
			this.updateLayout();
		}

		this.lastHeight = currentHeight;
	},

	updateSolutionButton: function(){
		var solutions, solutionNode, ab, orNode;
		this.callParent(arguments);
		if(!this.submitted){
			return;
		}

		ab = this.solutionAnswerBox;
		ab.update('');

		solutions = this.part.get('solutions');
		Ext.each(solutions, function(s, idx){
			solutionNode = document.createElement('span');
			ab.appendChild(solutionNode);
			solutionNode.innerHTML = s.get('value');
			jQuery(solutionNode).mathquill();

			if(idx < solutions.length - 1){
				ab.appendChild(document.createElement('br'));
				//WTF extjs why cant I just create and append a textnode
				orNode = document.createElement('span');
				orNode.innerHTML = ' or: ';
				ab.appendChild(orNode);
			}
		});
	},

	mathSymbolClicked: function(e){
		if(this.submitted){return;}
		var t = e.getTarget();
		jQuery(this.mathquillSpan).mathquill('write', t.getAttribute('data-latex'));
		this.mathquillSpan.focus();
	},


	getValue: function(){
		return jQuery(this.mathquillSpan).mathquill('latex');
	},


	setValue: function(latex){
		jQuery(this.mathquillSpan).mathquill('latex', latex);
		this.adjustSize();
	},


	reset: function(){
		this.callParent(arguments);
		this.setValue('');
		jQuery(this.mathquillSpan).mathquill('revert').mathquill('editable');
		this.attachKeyListeners();
	},


	markCorrect: function(){
		this.callParent(arguments);
		this.disableMathquillEditable();
	},


	markIncorrect: function(){
		this.callParent(arguments);
		this.disableMathquillEditable();
	},

	disableMathquillEditable: function(){
		console.log('disabling');
		jQuery(this.mathquillSpan).mathquill('revert').mathquill();
	},

	focus: function(){
		this.mathquillSpan.focus();
	}

});
