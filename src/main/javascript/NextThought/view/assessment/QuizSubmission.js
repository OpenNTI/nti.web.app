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
		{ cls: 'status' }
	]),

	renderSelectors: {
		statusMessage: '.status',
		resetBtn: '.reset',
		submitBtn: '.submit'
	},

	initComponent: function(){
		var answeredMap = {};

		this.callParent(arguments);

		this.mon(this.questionSet,'answered',this.updateStatus,this);

		Ext.each(this.questionSet.get('questions'),function(q){
			answeredMap[q.getId()] = false;
		});

		this.answeredMap = answeredMap;
	},


	afterRender: function(){
		this.callParent(arguments);
		this.reflectStateChange();
		this.mon(this.resetBtn,'click',this.resetClicked,this);
		this.mon(this.submitBtn,'click',this.submitClicked,this);
	},



	updateStatus: function(question, part, status){
		this.answeredMap[question.getId()] = Boolean(status);
		this.reflectStateChange();
	},


	reflectStateChange: function(){
		var unanswered = 0;
		if(!this.rendered){ return; }

		Ext.Object.each(this.answeredMap,function(k,v){ if(!v){unanswered++;} });
		this.statusMessage.update(unanswered===0
				? 'All questions answered'
				: Ext.String.format('{0} questions unanswered',unanswered)
		);

		this.statusMessage[((unanswered===0)?'add':'remove')+'Cls']('ready');
	},


	resetClicked: function(){
		var q = this.questionSet;
		if( q.fireEvent('beforereset') ){
			q.fireEvent('reset');
			console.log('fired reset');
		}
		else {
			console.log('reset aborted');
		}
	},


	submitClicked: function(){
		console.log('submit!');
	}


});
