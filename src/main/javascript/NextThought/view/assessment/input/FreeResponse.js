Ext.define('NextThought.view.assessment.input.FreeResponse',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-freeresponsepart',

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
		this.solutionAnswerBox.insertFirst(['Answer: ',{tag: 'span'}]);
		this.solutionAnswerBox = this.solutionAnswerBox.down('span');

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
		this.inputBox.removeCls('incorrect').addCls('correct');
		this.inputField.set({readOnly:true});
	},


	markIncorrect: function(){
		this.callParent(arguments);
		this.inputBox.removeCls('correct').addCls('incorrect');
		this.inputField.set({readOnly:true});
	},


	reset: function(){
		this.callParent(arguments);
		this.inputBox.removeCls(['incorrect','correct']);
		this.inputField.dom.removeAttribute('readOnly');
		this.inputField.dom.value = '';
//		this.inputField.focus();
	}
});
