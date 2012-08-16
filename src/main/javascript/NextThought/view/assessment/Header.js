Ext.define('NextThought.view.assessment.Header',{
	extend: 'Ext.Component',
	alias: 'widget.question-header',

	cls: 'header',
	ui: 'assessment',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'controls',
			cn: [{ cls: 'favorite' },{ cls: 'like' }]
		},
		{cls:'title',html:'{title}'},
		{cls: 'status {status}',html:'{status}'}
	]),

	renderSelectors: {
		myTitle: '.title',
		status: '.status'
	},


	initComponent: function(){
		this.callParent(arguments);
	},


	onAdded: function(assessmentParent){
		var id = '?unresolved title?';
		try {
			//HACK: there should be a more correct way to get the problem name/number...
			id = assessmentParent.question.getId().split('.').last() + '.';
		}
		catch(e){
			console.warn(Globals.getError(e));
		}

		this.setTitle(id);
	},


	setTitle: function(title){
		if(!this.rendered){
			this.renderData.title = title;
			return;
		}
		this.myTitle.update(title);
	},


	markCorrect: function(){
		this.el.removeCls('incorrect').addCls('correct');
		this.status.update('Correct!');
	},

	markIncorrect: function(){
		this.el.removeCls('correct').addCls('incorrect');
		this.status.update('Incorrect');
	},

	reset: function(){
		this.el.removeCls('incorrect','correct');
		this.status.update('');
	}
});
