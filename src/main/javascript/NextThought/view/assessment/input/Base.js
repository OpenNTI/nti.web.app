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
					{ cls: 'answer', cn:[{tag: 'span'}] },
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
					{cls:'action solution', html: 'Show Solution'}
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


	filterHTML: function(html){
		return html.replace(/<\/?(html|body|a|p).*?>/ig, '')
				.replace(/^\s+/,'')
				.replace(/\s+$/,'');
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

		this.checkItBtn.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.solutionAnswerBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.inputBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.solutionBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.footer.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.reset();
		this.disableSubmission();
	},


	checkit: function(){
		if(this.submissionDisabled){return;}
		if(this.submitted){
			this.up('assessment-question').reset();
			return;
		}

		this.setSubmitted();
		this.fireEvent('check-answer',this.up('assessment-question'), this.question, this.part, this.getValue());
	},


	setSubmitted: function(){
		this.submitted = true;
		this.checkItBtn.update('Try again');
	},


	getOrdinal: function(){
		if(!Ext.isNumber(this.ordinal)){
			Ext.Error.raise('The question part\'s ordinal was not set or incorrectly set.');
		}
		return this.ordinal;
	},


	getValue: function(){
		console.log(this.$className+' does not implement the getValue function');
	},


	updateSolutionButton: function(){
		var p = this.part,
			a = this.solutionAnswerBox,
			b = this.showSolutionBtn,
			e = this.solutionExplanationBox,

			answer = this.el.down('.answer'),
			label = b.getHTML().replace(/(solution|hint)$/i,'{0}');

		answer.setVisibilityMode(Ext.dom.Element.DISPLAY);

		b.update(label.replace('{0}', this.hintActive? 'Hint' : 'Solution'));

		if(this.hintActive){
			answer.hide();
			e.update(this.filterHTML( p.get('hints')[this.currentHint || 0].get('value') ));
		}
		else if(this.submitted){
			answer.show();
			a.update(this.getSolutionContent(p));
			e.update(p.get('explanation'));
		}
		else {
			a.update('');
			e.update('');
		}

		if(e.getHTML()==='' && a.getHTML()===''){ b.hide(); } else { b.show(); }
	},


	markCorrect: function(){
		this.footer.hide();
		this.checkItBtn.removeCls('wrong');
		this.updateLayout();
	},


	markIncorrect: function(){
		this.checkItBtn.addCls('wrong');
		this.hintActive = false;
		this.updateSolutionButton();
	},


	reset: function(){
		this.submitted = false;
		this.hintActive = (this.part.get('hints').length > 0);
		this.currentHint = 0;
		this.updateSolutionButton();
		this.footer.show();
		this.checkItBtn.removeCls('wrong').update('Check It!');
		this.hideSolution();
		this.disableSubmission();
		this.updateLayout();
	},


	enableSubmission: function(){
		delete this.submissionDisabled;
		this.checkItBtn.removeCls('disabled');
		if( this.questionSet ){
			this.questionSet.fireEvent('answered', this.question, this.part, true);
		}
	},


	disableSubmission: function(){
		this.submissionDisabled = true;
		this.checkItBtn.addCls('disabled');
		if( this.questionSet ){
			this.questionSet.fireEvent('answered', this.question, this.part, false);
		}
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
		var label = this.showSolutionBtn.getHTML();
		this.showSolutionBtn.update(label.replace('Hide','Show'));
		this.solutionBox.hide();
		this.inputBox.show();
		this.updateLayout();
	},


	showSolution: function(){
		var label = this.showSolutionBtn.getHTML();

		this.updateSolutionButton();
		this.currentHint = ((this.currentHint+1) % (this.part.get('hints').length || 1));

		this.showSolutionBtn.update(label.replace('Show','Hide'));
		this.inputBox.hide();
		this.solutionBox.show();
		this.updateLayout();
	}
});
