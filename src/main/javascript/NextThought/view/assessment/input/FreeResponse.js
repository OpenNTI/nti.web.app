Ext.define('NextThought.view.assessment.input.FreeResponse',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-freeresponsepart',

	inputTpl: Ext.DomHelper.markup({
		tag: 'input',
		type: 'text',
		placeholder: 'Answer',
		tabIndex: '{tabIndex}',
		cls: 'answer-field tabable'
	}),

	renderSelectors: {
		inputField: '.answer-field'
	},


	initComponent: function(){
		this.renderData = Ext.apply(this.renderData || {}, {
			tabIndex: this.tabIndexTracker.getNext()
		});

		this.callParent(arguments);
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


	enterKeyFilter: function(e,dom){
		var i, x, next;
		if(e.getKey()=== e.ENTER){

			if(this.questionSet){
				i = this.el.up('.assessment-overlay').query('.tabable');
				x = i.length-1;
				for(x; x>=0; x--){ if(i[x]===dom){ next = i[x+1]||i[0]; break; } }
				next.focus();
			}
			else{
				this.checkit();
			}
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
