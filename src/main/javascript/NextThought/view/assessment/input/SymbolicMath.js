Ext.define('NextThought.view.assessment.input.SymbolicMath',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-symbolicmathpart',

	inputTpl: Ext.DomHelper.markup({
		tag: 'input',
		type: 'text',
		placeholder: 'Answer',
		cls: 'answer-field'
	}),

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
			}
		});
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
