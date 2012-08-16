Ext.define('NextThought.view.assessment.ScoreboardHeader',{
	extend: 'Ext.Component',
	alias: 'widget.assessment-scoreboard-header',

	cls: 'score-header',
	ui: 'assessment',

	renderTpl: Ext.DomHelper.markup([{cls:'time',cn:[{tag:'span'},{cls:'arrow'}]},{cls:'title',html:'Scoreboard'}]),

	renderSelectors: {
		time: '.time span',
		arrow: '.time .arrow'
	},


	initComponent: function(){
		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.time.update(Ext.Date.format(new Date(),'m/d/y g:ia'));
		/*
			if there is no history, hide arrow, don't indicate that the timestamp is clickable.
		*/
	}
});
