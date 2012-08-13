Ext.define('NextThought.view.assessment.Question',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.assement-question',

	requires: [
		'NextThought.view.assessment.Header',
		'NextThought.view.assessment.Response'
	],

	statics: {
		syncPositioning : Ext.Function.createBuffered(function(){
			Ext.each(Ext.ComponentQuery.query('assement-question'),function(q){ q.syncTop(); }); },10)
	},

	plain: true,
	autoRender: true,
	cls: 'question',
	ui: 'assessment',

	dockedItems: [
		{ dock: 'top', xtype: 'question-header'},
		{ dock: 'bottom', xtype: 'question-response'}
	],

	setupContentElement: function(){
		var el = Ext.get(this.contentElement);
		var sol = el.down('.naqsolutions');
		if(sol){
			sol.remove();
		}

		el.setStyle({
			overflow: 'hidden',
			display: 'block',
			visibility: 'hidden',
			margin: '30px auto'
		});
	},


	initComponent: function(){
		this.callParent(arguments);
		//TODO: this is a shortcut, assuming there is only one part to the question.
		var part = this.questionPart = this.question.get('parts').first();
		this.down('question-response').setQuestionAndPart(this.question,part);
		this.setQuestionContent();
		this.setupContentElement();
	},


	setQuestionContent: function(){
		var root = LocationProvider.getContentRoot();
		function fixRef(original,attr,url) {
			return (/^data:/i.test(url)) ? original : attr+'="'+root+url+'"'; }

		this.update(this.questionPart.get('content').replace(/(src)="(.*?)"/igm, fixRef));
		this.updateLayout();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getTargetEl().select('img').on('load',function(){
			this.updateLayout();
			this.syncElementHeight();
		},this,{single:true});
		this.syncTop();
	},


	afterLayout: function(){
		this.syncElementHeight();
		this.callParent(arguments);
	},

	markCorrect: function(){
		this.down('question-header').markCorrect();
		this.down('question-response').markCorrect();
	},
	markIncorrect: function(){
		this.down('question-header').markIncorrect();
		this.down('question-response').markIncorrect();
	},
	reset: function(){
		this.down('question-header').reset();
		this.down('question-response').reset();
	},


	syncTop: function(){
		var o = this.reader.getAnnotationOffsets();
		var myTop = Ext.fly(this.contentElement).getY();
		var ctTop = this.el.up('.x-reader-pane').getY();
		var top = (myTop + ctTop) - o.scrollTop;
		this.el.setY(top);
	},


	syncElementHeight: function(){
		var h = this.getHeight();
		Ext.get(this.contentElement).setHeight(h);
		this.self.syncPositioning();
	}

});
