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
		data.renderSelectors = Ext.applyIf(data.renderSelectors||{},cls.superclass.renderSelectors);

		data.inputTpl = data.inputTpl || cls.superclass.inputTpl || false;
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		//merge in subclass's input template
		var tpl = this.prototype.renderTpl
				.replace('{input}',data.inputTpl||'')
				.replace('{toolbar}',data.toolbarTpl||'');

		if(!data.renderTpl){
			data.renderTpl = tpl;
		}
		else {
			data.renderTpl = data.renderTpl.replace('{super}',tpl);
		}
	},


	getSolutionContent: function(part) {
		var solutions = [];
		Ext.each(part.get('solutions'),function(s){
			solutions.push(s.get('value'));
		});

		return solutions.join('<br/> or: ');
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents({ 'check-answer':true });
	},


	afterRender: function(){
		this.callParent(arguments);
		var me = this;
		var p = this.part;
		var a = this.solutionAnswerBox;
		var e = this.solutionExplanationBox;

		a.update(me.getSolutionContent(p));
		e.update(p.get('explanation'));

		if(e.getHTML()==='' && a.getHTML()===''){
			this.showSolutionBtn.hide();
		}

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
			this.up('assement-question').reset();
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
		this.checkItBtn.removeCls('wrong');
		this.updateLayout();
	},


	markIncorrect: function(){
		this.checkItBtn.addCls('wrong');
	},


	reset: function(){
		this.submitted = false;
		this.footer.show();
		this.checkItBtn.removeCls('wrong').update('Check It!');
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
		this.showSolutionBtn.update('Show Solution');
		this.solutionBox.hide();
		this.inputBox.show();
		this.updateLayout();
	},


	showSolution: function(){
		this.showSolutionBtn.update('Hide Solution');
		this.inputBox.hide();
		this.solutionBox.show();
		this.updateLayout();
	}
});
