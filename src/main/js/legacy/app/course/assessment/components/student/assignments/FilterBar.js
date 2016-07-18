var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.student.assignments.FilterBar', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-assignments-filterbar',
	ui: 'course-assessment',
	cls: 'assignment-filterbar',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'dropmenu disabled cell', cn: [
			{ cls: 'label', html: '{{{NextThought.view.courseware.assessment.assignments.FilterBar.allassignments}}}' }
		] },
		{ cls: 'dropmenu groupBy cell', cn: [
			{ cls: 'label', html: '{{{NextThought.view.courseware.assessment.assignments.FilterBar.alllessons}}}' }
		] },
		{ cls: 'search cell', cn: [
			{ tag: 'input', type: 'text', placeholder: '{{{NextThought.view.courseware.assessment.assignments.FilterBar.searchplaceholder}}}', required: 'required' },
			{ cls: 'clear' }
		] },
		{ cls: 'create-assignment cell', html: 'Create'}
	]),

	renderSelectors: {
		groupEl: '.groupBy',
		searchEl: '.search input',
		clearEl: '.search .clear',
		createEl: '.create-assignment'
	},

	bubbleEvents: ['filters-changed', 'search-changed', 'create-assignment'],

	afterRender: function () {
		this.callParent(arguments);
		this.currentGrouping = 'lesson';
		this.searchKey = '';

		this.createGroupByMenu();

		this.mon(this.groupEl, 'click', 'showGroupByMenu');
		this.mon(this.searchEl, 'keyup', 'searchKeyPressed');
		this.mon(this.clearEl, 'click', 'clearSearch');
		this.mon(this.createEl, 'click', this.createAssignment.bind(this));

		this.createEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		if (!this.shouldShowCreateButton) {
			this.createEl.hide();
		}
	},


	searchKeyPressed: function (e) {
		var key = e.keyCode;

		if (key === e.ENTER) {
			//refresh the list
			this.fireEvent('filters-changed');
			return;
		}

		if (this.searchKey === this.searchEl.getValue()) {
			return;
		} else {
			this.searchKey = this.searchEl.getValue();
		}

		//update without refreshing
		clearTimeout(this.doSearchTimeout);

		this.doSearchTimeout = setTimeout(() => {
			this.fireEvent('search-changed', this.searchKey);
		}, 250);
	},


	showCreateButton () {
		this.shouldShowCreateButton = true;

		if (this.createEl) {
			this.createEl.show();
		}
	},


	hideCreateButton () {
		delete this.shouldShowCreateButton;

		if (this.createEl) {
			this.createEl.hide();
		}
	},


	showPublishOption () {
		this.shouldShowPublishOption = true;

		if (this.rendered) {
			this.createGroupByMenu();
		}
	},


	hidePublishOption () {
		delete this.shouldShowPublishOption;

		if (this.rendered) {
			this.createGroupByMenu();
		}
	},


	clearSearch: function () {
		this.searchEl.dom.value = '';
		this.searchKey = '';
		this.fireEvent('search-changed', '');
	},


	showGroupByMenu: function () {
		var menu = this.groupByMenu, item = menu.down('[checked]');
		if (!this.groupEl.hasCls('disabled')) {
			if (item) {
				menu.insert(0, item);
			}
			menu.showBy(this.groupEl, 'tl-tl');
		}
	},


	createGroupByMenu: function () {
		if (this.groupByMenu) {
			this.groupByMenu.destroy();
		}

		var type = this.currentGrouping, items = [
				{ text: getString('NextThought.view.courseware.assessment.assignments.FilterBar.alllessons'), groupBy: 'lesson', checked: type === 'lesson'},
				{ text: getString('NextThought.view.courseware.assessment.assignments.FilterBar.due'), groupBy: 'due', checked: type === 'due'},
				{ text: getString('NextThought.view.courseware.assessment.assignments.FilterBar.completion'), groupBy: 'completion', checked: type === 'completion'}
			];

		if (this.shouldShowPublishOption) {
			items.push({ text: getString('NextThought.view.courseware.assessment.assignments.FilterBar.publicationstatus'), groupBy: 'publication', checked: type === 'publication'});
		}

		this.groupByMenu = Ext.widget('menu', {
			cls: 'group-by-menu',
			width: 213,
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


	selectGroupBy: function (groupBy) {
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


	updateOrdering: function (item) {
		var offset = item.getOffsetsTo(this.groupByMenu),
			x = offset && offset[1];

		this.groupEl.down('.label').update(item.text);
		this.groupByMenu.offset = [0, -x];

		this.currentGrouping = item.groupBy;
	},


	switchOrdering: function (item, status) {
		if (!status) { return; }


		this.updateOrdering(item);
		this.fireEvent('filters-changed');
	},

	enableGroupBy: function (status) {
		if(status) {
			this.groupEl.el.removeCls('disabled');
			this.groupByMenu.enable(true);
		}else{
			this.groupEl.el.addCls('disabled');
			this.groupByMenu.disable(true);
		}
	},

	getShowType: function () {

	},


	getGroupBy: function () {
		return this.currentGrouping || 'lesson';
	},


	getSearch: function () {
		return this.searchKey || '';
	},

	setSearch: function (value) {
		this.searchEl.dom.value = value;
		this.searchkey = value;
	},


	createAssignment () {
		this.fireEvent('create-assignment');
	}
});
