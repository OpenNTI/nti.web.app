Ext.define('NextThought.view.assessment.QuizSubmission',{
	extend: 'NextThought.view.assessment.Panel',
	alias: 'widget.assessment-quiz-submission',
	requires: [
	],

	cls: 'submission-panel',
	appendPlaceholder: true,
	hidden: true,

	/* Because we're inheriting from a "Panel" to get the special handling provided by the super class, we can't use
	 * our typical renderTpl. Instead we're going to take advantage of the Ext.panal.Panel's html config property...
	 *
	 * We don't normally do this for our custom widgets, because the Panel is a fairly heavy weight component, so don't
	 * use this class as an exmaple of how to make custom components.
	 */
	html: Ext.DomHelper.markup([
		{ cls: 'buttons', cn: [
			{tag: 'a', href:'#', cls: 'reset', html: 'Start Over'},
			{tag: 'a', href:'#', cls: 'submit tabable', html: 'I\'m Finished!'}
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
		this.hide();
		this.mon(this.questionSet, {
			scope: this,
			'answered': this.updateStatus,
			'reset': this.reset,
			'graded': this.graded
		});

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
		var r = this.resetBtn,
			s = this.submitBtn,
			t = this.tabIndexTracker;
		setTimeout(function(){
			s.set({tabIndex:t.getNext()});
			r.set({tabIndex:t.getNext()});
		},1);
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


	reset: function(){
		this.submitBtn.removeCls('disabled');
		delete this.submitted;
	},


	graded: function(){
		this.submitted = true;
		this.submitBtn.addCls('disabled');
	},


	resetClicked: function(e){
		var q = this.questionSet;
		if( q.fireEvent('beforereset') ){
			q.fireEvent('reset');
			console.log('fired reset');
		}
		else {
			console.log('reset aborted');
		}

		if( e ){
			e.stopEvent();
			return false;
		}
	},


	submitClicked: function( e ){
		if(this.submitted){return;}
		var q = this.questionSet,
			submission = {};
		if( !q.fireEvent('beforesubmit',q,submission) ){
			console.log('submit aborted');
			return;
		}

		this.fireEvent('grade-it',this,q,submission);

		if( e ){
			e.stopEvent();
			return false;
		}
	},



	setGradingResult: function(assessedQuestionSet){
		this.questionSet.fireEvent('graded',assessedQuestionSet);
	},


	syncTop: function(){
		this.show();
		this.callParent();
	}
});
