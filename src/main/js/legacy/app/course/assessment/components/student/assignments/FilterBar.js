var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.student.assignments.FilterBar', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-assignments-filterbar',
	ui: 'course-assessment',
	cls: 'assignment-filterbar',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'third dropmenu disabled', cn: [
			{ cls: 'label', html: '{{{NextThought.view.courseware.assessment.assignments.FilterBar.allassignments}}}' }
		] },
		{ cls: 'third dropmenu groupBy', cn: [
			{ cls: 'label', html: '{{{NextThought.view.courseware.assessment.assignments.FilterBar.alllessons}}}' }
		] },
		{ cls: 'third search', cn: [
			{ tag: 'input', type: 'text', placeholder: '{{{NextThought.view.courseware.assessment.assignments.FilterBar.searchplaceholder}}}', required: 'required' },
			{ cls: 'clear' }
		] }
	]),

	renderSelectors: {
		groupEl: '.groupBy',
		searchEl: '.search input',
		clearEl: '.search .clear'
	},

	bubbleEvents: ['filters-changed', 'search-changed'],


	afterRender: function() {
		this.callParent(arguments);
		this.currentGrouping = 'lesson';
		this.searchKey = '';

		this.createGroupByMenu();

		this.mon(this.groupEl, 'click', 'showGroupByMenu');
		this.mon(this.searchEl, 'keyup', 'searchKeyPressed');
		this.mon(this.clearEl, 'click', 'clearSearch');
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


	clearSearch: function() {
		this.searchEl.dom.value = '';
		this.searchKey = '';
		this.fireEvent('search-changed', '');
	},


	showGroupByMenu: function() {
		var menu = this.groupByMenu, item = menu.down('[checked]');
		if (!this.groupEl.hasCls('disabled')) {
				if (item) {
					menu.insert(0, item);
				}
				menu.showBy(this.groupEl, 'tl-tl');
		}
	},


	createGroupByMenu: function() {
		var type = this.currentGrouping, items = [
				{ text: getString('NextThought.view.courseware.assessment.assignments.FilterBar.alllessons'), groupBy: 'lesson', checked: type === 'lesson'},
				{ text: getString('NextThought.view.courseware.assessment.assignments.FilterBar.due'), groupBy: 'due', checked: type === 'due'},
				{ text: getString('NextThought.view.courseware.assessment.assignments.FilterBar.completion'), groupBy: 'completion', checked: type === 'completion'}
			];

		this.groupByMenu = Ext.widget('menu', {
			cls: 'group-by-menu',
			width: 257,
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

		this.groupByMenu.show().hide();
	},


	selectGroupBy: function(groupBy) {
		if (!this.rendered) {
			this.on('afterrender', this.selectGroupBy.bind(this, groupBy));
			return;
		}

		var item = this.groupByMenu.down('[groupBy="' + groupBy + '"]');

		if (item) {
			this.updateOrdering(item);
			item.setChecked(true, true);
		}
	},


	updateOrdering: function(item) {
		var offset = item.getOffsetsTo(this.groupByMenu),
			x = offset && offset[1];

		this.groupEl.down('.label').update(item.text);
		this.groupByMenu.offset = [0, -x];

		this.currentGrouping = item.groupBy;
	},


	switchOrdering: function(item, status) {
		if (!status) { return; }


		this.updateOrdering(item);
		this.fireEvent('filters-changed');
	},

	enableGroupBy: function(status){
		if(status){
			this.groupEl.el.removeCls('disabled');
			this.groupByMenu.enable(true);
		}else{
			this.groupEl.el.addCls('disabled');
			this.groupByMenu.disable(true);
		}
	},

	getShowType: function() {

	},


	getGroupBy: function() {
		return this.currentGrouping || 'lesson';
	},


	getSearch: function() {
		return this.searchKey || '';
	},

	setSearch: function(value) {
		this.searchEl.dom.value = value;
		this.searchkey = value;
	}
});
