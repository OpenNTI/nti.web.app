Ext.define('NextThought.view.courseware.assessment.assignments.FilterBar', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-assignments-filterbar',
	ui: 'course-assessment',
	cls: 'assignment-filterbar',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'third dropmenu disabled', cn: [
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

	renderSelectors: {
		groupEl: '.groupBy',
		searchEl: '.search input'
	},

	bubbleEvents: ['filters-changed', 'search-changed'],


	afterRender: function() {
		this.callParent(arguments);
		this.currentGrouping = 'lesson';
		this.searchKey = '';

		this.createGroupByMenu();

		this.mon(this.groupEl, 'click', 'showGroupByMenu');
		this.mon(this.searchEl, 'keyup', 'searchKeyPressed');
	},


	searchKeyPressed: function(e) {
		var key = e.keyCode;

		this.searchKey = this.searchEl.getValue();

		if (key === e.ENTER) {
			//refresh the list
			this.fireEvent('filters-changed');
			return;
		}

		//update without refreshing
		this.fireEvent('search-changed', this.searchKey);
	},


	showGroupByMenu: function() {
		this.groupByMenu.showBy(this.groupEl, 'tl-tl', this.groupByMenu.offset);
	},


	createGroupByMenu: function() {
		var type = this.currentGrouping,
			items = [
				{ text: 'By Lesson', groupBy: 'lesson', checked: type === 'lesson'},
				{ text: 'By Due Date', groupBy: 'due', checked: type === 'due'},
				{ text: 'By Completion', groupBy: 'completion', checked: type === 'completion'}
			];

		this.groupByMenu = Ext.widget('menu', {
			ui: 'nt',
			cls: 'group-by-menu',
			plain: true,
			shadow: false,
			width: 257,
			frame: false,
			border: false,
			ownerCmp: this,
			offset: [0, 0],
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


	switchOrdering: function(item, status) {
		if (!status) { return; }
		var offset = item.getOffsetsTo(this.groupByMenu),
			x = offset && offset[1];

		this.groupEl.el.down('.label').update(item.text);

		this.groupByMenu.offset = [0, -x];

		this.currentGrouping = item.groupBy;
		this.fireEvent('filters-changed');
	},


	getShowType: function() {

	},


	getGroupBy: function() {
		return this.currentGrouping || 'lesson';
	},


	getSearch: function() {
		return this.searchKey || '';
	}
});
