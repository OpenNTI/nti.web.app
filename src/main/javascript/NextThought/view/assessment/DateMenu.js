Ext.define('NextThought.view.assessment.DateMenu',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.assessment-date-menu',
	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 150,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true
	},

	setResults: function(results) {
		var items = [];
		Ext.each(results, function(value, index){
			items.push(this.getMenuItem(value, (index === 0)));
		}, this);
		this.removeAll(true);
		this.add(items);
	},


	addResult: function(assessment){
		//create a new menu item for this:
		this.insert(0, this.getMenuItem(assessment, true));
	},


	getMenuItem: function(v, checked) {
		return {
			text: this.formatLabel(v),
			assessment: v,
			group: 'assessment-results',
			checked: checked
		};
	},


	formatLabel: function(assessment) {
		if (assessment){ return Ext.Date.format(assessment.get('Last Modified'), 'm/d/y g:ia'); }
		return '';
	},


	getSelectedText: function(){
		return this.formatLabel(this.down('[checked=true]').assessment);
	},

	getSelectedAssessment: function(item){
		return (item||this.down('[checked=true]')).assessment;
	}
});
