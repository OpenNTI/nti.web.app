Ext.define('NextThought.view.courseware.assessment.assignments.FilterBar', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-assignments-filterbar',
	ui: 'course-assessment',
	cls: 'assignment-filterbar',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'third dropmenu', cn: [
			{ cls: 'label', html: 'All Assignments' }
		] },
		{ cls: 'third dropmenu groupBy', cn: [
			{ cls: 'label', html: 'By Lesson' }
		] },
		{ cls: 'third search', cn: [
			{ tag: 'input', type: 'text', placeholder: 'Search Assignments', required: 'required' },
			{ cls: 'clear' }
		] }
	]),

	renderSelectors:{
		groupEl: '.groupBy'
	},


	afterRender: function(){
		this.callParent(arguments);
		this.currentGrouping = 'lesson';

		this.createGroupByMenu();

		this.mon(this.groupEl,'click','showGroupByMenu');
	},

	
	showGroupByMenu: function(){
		this.groupByMenu.showBy(this.groupEl, 'tl-tl', this.groupByMenu.offset);
	},


	createGroupByMenu: function(){
		var type = this.currentGrouping,
			items = [
				{ text: 'By Lesson', groupBy: 'lesson', checked: type === 'lesson'},
				{ text: 'By Due Date', groupBy: 'due', checked: type === 'due'},
				{ text: 'By Completion', grouBy: 'completion', checked: type === 'completion'}
			];

		this.groupByMenu = Ext.widget('menu',{
			ui: 'nt',
			cls: 'group-by-menu',
			plain: true,
			shadow: false,
			width: 257,
			frame: false,
			border: false,
			ownerCmp: this,
			offset: [0,0],
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				group: 'groupByOptions',
				cls: 'group-by-option',
				height: 50,
				plain: true,
				listeners: {
					scope: this,
					'checkchange': 'switchOrdering'
				}
			},
			items: items
		});
	},


	switchOrdering: function(item){
		var offset = item.getOffsetsTo(this.groupByMenu),
			x = offset && offset[1];

		this.groupEl.el.down('.label').update(item.text);

		this.groupByMenu.offset = [0,-x];

		this.currentGrouping = item.groupBy;
	},


	getShowType: function() {

	},


	getGroupBy: function() {

	},


	getSearch: function() {

	}
});
