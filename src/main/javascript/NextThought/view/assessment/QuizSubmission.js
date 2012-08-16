Ext.define('NextThought.view.assessment.QuizSubmission',{
	extend: 'NextThought.view.assessment.Panel',
	alias: 'widget.assessment-quiz-submission',
	requires: [
	],

	cls: 'submission-panel',
	appendPlaceholder: true,

	/* Because we're inheriting from a "Panel" to get the special handling provided by the super class, we can't use
	 * our typical renderTpl. Instead we're going to take advantage of the Ext.panal.Panel's html config property...
	 *
	 * We don't normally do this for our custom widgets, because the Panel is a fairly heavy weight component, so don't
	 * use this class as an exmaple of how to make custom components.
	 */
	html: Ext.DomHelper.markup([
		{ cls: 'buttons', cn: [
			{cls: 'reset', html: 'Start Over'},
			{cls: 'submit', html: 'I\'m Finished!'}
		] },
		{ cls: 'status ready', html: 'All questions answered' }
	]),

	renderSelectors: {
		statusMessage: '.status',
		resetBtn: '.reset',
		submitBtn: '.submit'
	},

	initComponent: function(){
		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.resetBtn,'click',this.resetClicked,this);
		this.mon(this.submitBtn,'click',this.submitClicked,this);
	},



	resetClicked: function(){
		console.log('reset!');
	},


	submitClicked: function(){
		console.log('submit!');
	}


});
