Ext.define('NextThought.view.assessment.input.Base',{
	extend: 'Ext.Component',
	alias: 'widget.abstract-question-input',

	cls: 'field',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'response-container',
			cn:[
				{ cls: 'inputbox', html: '{input}' },
				{ cls: 'solution', cn:[
					{ cls: 'close' },
					{ cls: 'answer', cn:['Answer: ',{tag: 'span'}] },
					{ cls: 'explanation'}
				] }
			]
		},{
			cls: 'footer',
			cn: [{
				cls: 'left', html: '{toolbar}'
			},{
				cls: 'right',
				cn: [
					{cls:'action check'},
					{cls:'action solution'}
				]
			}]
		}
	]),


	renderSelectors: {
		inputBox: '.response-container .inputbox',
		solutionBox: '.response-container .solution',
		solutionClose: '.response-container .solution .close',
		solutionAnswerBox: '.response-container .solution .answer span',
		solutionExplanationBox: '.response-container .solution .explanation',
		showSolutionBtn: '.footer .action.solution',
		checkItBtn: '.footer .action.check',
		footer: '.footer'
	},


	onClassExtended: function(cls, data) {
		Ext.applyIf(data.renderSelectors,cls.superclass.renderSelectors);

		//merge in subclass's input template
		var tpl = cls.superclass.renderTpl
				.replace('{input}',data.inputTpl||'')
				.replace('{toolbar}',data.toolbarTpl||'');

		if(!data.renderTpl){
			data.renderTpl = tpl;
		}
		else {
			data.renderTpl = data.renderTpl.replace('{super}',tpl);
		}
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents({ 'check-answer':true });
	},


	afterRender: function(){
		this.callParent(arguments);
		var p = this.part;
		var a = this.solutionAnswerBox;
		var e = this.solutionExplanationBox;
		var solutions = [];

		Ext.each(p.get('solutions'),function(s){
			solutions.push(s.get('value'));
		});

		a.update(solutions.join('<br/> or: '));

		e.update(p.get('explanation'));

		this.mon(this.showSolutionBtn, {
			scope: this,
			click: this.toggleSolution
		});

		this.mon(this.checkItBtn,{
			scope: this,
			click: this.checkit
		});

		this.mon(this.solutionClose,{
			scope: this,
			click: this.hideSolution
		});

		this.inputBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.solutionBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.footer.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.hideSolution();
		this.reset();
		this.disableSubmission();
	},

	checkit: function(){
		if(this.submissionDisabled){return;}
		if(this.submitted){
			this.reset();
			return;
		}

		this.submitted = true;
		this.checkItBtn.update('Try again');
		this.fireEvent('check-answer',this.up('assement-question'), this.question, this.part, this.getValue());
	},

	getValue: function(){
		console.log(this.$className+' does not implement the getValue function');
	},


	markCorrect: function(){
		this.footer.hide();
		this.inputBox.removeCls('incorrect').addCls('correct');
		this.updateLayout();
	},

	markIncorrect: function(){
		this.inputBox.removeCls('correct').addCls('incorrect');
	},

	reset: function(){
		this.submitted = false;
		this.footer.show();
		this.checkItBtn.update('Check It!');
		this.inputBox.removeCls('incorrect','correct');
		this.updateLayout();
		this.disableSubmission();
	},


	enableSubmission: function(){
		delete this.submissionDisabled;
		this.checkItBtn.removeCls('disabled');
	},


	disableSubmission: function(){
		this.submissionDisabled = true;
		this.checkItBtn.addCls('disabled');
	},


	toggleSolution: function(){
		if(this.solutionBox.isVisible()){
			this.hideSolution();
		}
		else {
			this.showSolution();
		}
	},

	hideSolution: function(){
		this.showSolutionBtn.update('Show Answer');
		this.solutionBox.hide();
		this.inputBox.show();
		this.updateLayout();
	},

	showSolution: function(){
		this.showSolutionBtn.update('Hide Answer');
		this.inputBox.hide();
		this.solutionBox.show();
		this.updateLayout();
	}
});
