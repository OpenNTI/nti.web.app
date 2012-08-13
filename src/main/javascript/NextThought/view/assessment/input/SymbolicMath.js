Ext.define('NextThought.view.assessment.input.SymbolicMath',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-symbolicmathpart',

	inputTpl: Ext.DomHelper.markup({
		tag: 'input',
		type: 'text',
		placeholder: 'Answer',
		cls: 'answer-field'
	}),

	toolbarTpl: Ext.DomHelper.markup([
		{ cls: 'mathsymbol sqrt', 'data-latex': '\\\\surd' },
		{ cls: 'mathsymbol square', 'data-latex': 'x^2' },
		{ cls: 'mathsymbol parens', 'data-latex': '(x)'},
		{ cls: 'mathsymbol approx', 'data-latex': '\\\\approx' },
		{ cls: 'mathsymbol pi', 'data-latex': '\\\\pi' }
	]),

	renderSelectors: {
		inputField: '.answer-field'
	},

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.inputField,{
			scope: this,
			blur: function(e,dom){dom.setAttribute('placeholder','Answer');},
			focus: function(e,dom){dom.removeAttribute('placeholder');},
			keyup: function(e,dom){
				if(dom.value===''){ this.disableSubmission(); }
				else { this.enableSubmission(); }
			},
			keydown: this.enterKeyFilter
		});

		this.mon(this.getEl().select('.mathsymbol'),{
			scope: this,
			click: this.mathSymbolClicked
		});
	},


	mathSymbolClicked: function(e){
		var t = e.getTarget();
		this.inputField.dom.value += t.getAttribute('data-latex');
	},


	enterKeyFilter: function(e){
		if(e.getKey()=== e.ENTER){
			this.checkit();
			e.stopEvent();
			return false;
		}
	},


	getValue: function(){
		return this.inputField.getValue();
	},

	markCorrect: function(){
		this.callParent(arguments);
		this.inputField.set({readOnly:true});
	},

	markIncorrect: function(){
		this.callParent(arguments);
		this.inputField.set({readOnly:true});
	},

	reset: function(){
		this.callParent(arguments);
		this.inputField.dom.removeAttribute('readOnly');
		this.inputField.dom.value = '';
//		this.inputField.focus();
	}
});
