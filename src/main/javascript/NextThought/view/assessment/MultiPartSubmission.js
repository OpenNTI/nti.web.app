Ext.define('NextThought.view.assessment.MultiPartSubmission',{
	extend: 'Ext.Component',
	alias: 'widget.assessment-multipart-submission',
	requires: [
	],

	cls: 'multipart-submission',

	renderTpl: Ext.DomHelper.markup(
		{
			cls: 'footer',
			cn: [{cls: 'left'},
				{
					cls: 'right',
					cn: [
						{cls:'action check disabled'}
					]
				}
			]
		}),

	renderSelectors: {
		checkItBtn: '.footer .right .check'
	},

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.checkItBtn,{
			scope: this,
			click: this.checkit
		});
		this.reset();

		if(this.enabled){
			delete this.enabled;
			this.enableSubmission();
		}
	},


	checkit: function(){
		this.up('assessment-question').checkIt();
	},


	reset: function(){
		this.checkItBtn.removeCls('wrong').update('Check It!');
	},


	enableSubmission: function(){
		if (!this.rendered){
			this.enabled = true;
			return;
		}
		this.checkItBtn.removeCls('disabled');
	},


	disableSubmission: function(){
		if (!this.rendered){
			delete this.enabled;
			return;
		}
		this.checkItBtn.addCls('disabled');
	},


	updateWithResults: function(assessmentQuestion){
		this.enableSubmission();
		this.checkItBtn.removeCls('wrong').update('Try Again');
		if(!assessmentQuestion.isCorrect()){
			this.checkItBtn.addCls('wrong');
		}
	}


});
