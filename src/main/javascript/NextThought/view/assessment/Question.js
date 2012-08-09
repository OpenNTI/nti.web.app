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
	cls: 'question',
	ui: 'assessment',

	dockedItems: [
		{ dock: 'top', xtype: 'question-header'},
		{ dock: 'bottom', xtype: 'question-response'}
	],

	setupContentElement: function(){
		var el = Ext.get(this.contentElement);

		el.down('.naqsolutions').remove();

		el.setStyle({
			overflow: 'hidden',
			display: 'block',
			visibility: 'hidden',
			margin: '30px auto'
		});
	},


	getBubbleTarget: function(){
		return this.reader;
	},


	initComponent: function(){
		this.callParent(arguments);

		var content;
		var root = LocationProvider.getContentRoot();
		//TODO: this is a shortcut, assuming there is only one part to the question.
		var part = this.question.get('parts').first();

		this.down('question-response').setQuestionAndPart(this.question,part);

		this.setupContentElement();

		content = part.get('content');

		function fixRef(original,attr,url) {
			return (/^data:/i.test(url)) ? original : attr+'="'+root+url+'"'; }

		content = content.replace(/(src)="(.*?)"/igm, fixRef);

		this.update(content);
	},


	afterRender: function(){
		this.callParent(arguments);
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
		var ctTop = this.el.up('.x-reader-pane').dom.getBoundingClientRect().top;
		var top = (myTop + ctTop) - o.scrollTop;
		this.el.setY(top);
	},


	syncElementHeight: function(){
		var h = this.getHeight();
		Ext.get(this.contentElement).setHeight(h);
		this.self.syncPositioning();
	}

});
