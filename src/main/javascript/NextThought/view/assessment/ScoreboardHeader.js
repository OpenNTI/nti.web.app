Ext.define('NextThought.view.assessment.ScoreboardHeader',{
	extend: 'Ext.Component',

	requires:[
		'NextThought.view.assessment.DateMenu'
	],

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

		this.mon(this.questionSet, 'graded', this.addResult, this);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.time, 'click', this.showMenu, this);
		this.menu = Ext.widget({ xtype:'assessment-date-menu', ownerButton: this, items: [] });
		this.mon(this.menu, 'click', this.menuItemClicked, this);
	},


	showMenu: function(){
		this.menu.showBy(this.time,'t-b', [0,0]);
	},


	menuItemClicked: function(menu, item){
		this.time.update(this.menu.getSelectedText());
		this.questionSet.fireEvent('graded', this.menu.getSelectedAssessment(item), {origin: this});
	},


	setPriorResults: function(sortedAssessmentSets) {
		this.menu.setResults(sortedAssessmentSets);
		this.menuItemClicked(this.menu);
		this.maybeHideTime();
	},

	addResult: function(assessment, opts) {
		if (opts && opts.origin === this) {
			return;
		}

		this.menu.addResult(assessment);
		this.time.update(this.menu.getSelectedText());
		this.maybeHideTime();
	},

	maybeHideTime: function(){
		//only show time if there's a dropdown...
		if (this.menu.items.length < 2){
			this.time.hide();
			this.arrow.hide();
		}
		else {
			this.time.show();
			this.arrow.show();
		}
	}

});
