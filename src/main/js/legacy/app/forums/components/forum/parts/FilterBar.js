const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');

module.exports = exports = Ext.define('NextThought.app.forums.components.forum.parts.FilterBar', {
	extend: 'Ext.Component',
	alias: 'widget.forums-forum-filterbar',
	ui: 'course-assessment',
	cls: 'forum-filterbar assignment-filterbar forum-body-header',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'third dropmenu disabled', cn: [
			{ cls: 'label', html: '{{{NextThought.view.forums.forum.parts.FilterBar.alldiscussion}}}' }
		] },
		{ cls: 'third dropmenu groupBy', cn: [
			{ cls: 'label', html: '{{{NextThought.view.forums.forum.parts.FilterBar.mostrecent}}}' }
		] },
		{ cls: 'third search', cn: [
			{ tag: 'input', type: 'text', placeholder: '{{{NextThought.view.forums.forum.parts.FilterBar.searchplaceholder}}}', required: 'required' },
			{ cls: 'clear' }
		] }
	]),

	renderSelectors: {
		groupEl: '.groupBy',
		searchEl: '.search input',
		clearEl: '.search .clear'
	},

	bubbleEvents: ['filters-changed', 'search-changed'],


	afterRender: function () {
		this.callParent(arguments);
		this.currentSort = 'active';

		if (this.searchKey) {
			this.setSearch(this.searchKey);
		} else {
			this.searchKey = '';
		}

		this.searchKeyPressed = Ext.Function.createBuffered(this.searchKeyPressed, 500, this);

		this.createGroupByMenu();

		this.mon(this.groupEl, 'click', 'showGroupByMenu');
		this.mon(this.searchEl, 'keyup', 'searchKeyPressed');
		this.mon(this.clearEl, 'click', 'clearSearch');
	},


	searchKeyPressed: function (e) {
		var key = e.keyCode;

		this.searchKey = this.searchEl.getValue();

		if (key === e.ENTER) {
			//refresh the list
			this.fireEvent('sorters-changed', this.currentSort, this.searchKey);
			return;
		}

		//update without refreshing
		this.fireEvent('search-changed', this.searchKey);
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
		var type = this.currentSort,
			items = [
				{ text: getString('NextThought.view.forums.forum.parts.FilterBar.mostrecent'), groupBy: 'active', checked: type === 'active'},
				{ text: getString('NextThought.view.forums.forum.parts.FilterBar.creation'), groupBy: 'created', checked: type === 'created'},
				{ text: getString('NextThought.view.forums.forum.parts.FilterBar.comment'), groupBy: 'comment', checked: type === 'comment'},
				{ text: getString('NextThought.view.forums.forum.parts.FilterBar.likes'), groupBy: 'likes', checked: type === 'likes'}
				//{ text: 'By Author', groupBy: 'creator', checked: type === 'creator'}
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
	},


	switchOrdering: function (item, status) {
		if (!status) { return; }
		var offset = item.getOffsetsTo(this.groupByMenu),
			x = offset && offset[1];

		this.groupEl.el.down('.label').update(item.text);

		this.groupByMenu.offset = [0, -x];

		this.currentSort = item.groupBy;
		this.fireEvent('sorters-changed', item.groupBy, this.searchKey);
	},


	setSortBy: function (group) {
		if (!this.rendered) {
			this.on('afterrender', this.setSortBy.bind(this, group));
			return;
		}

		var item = this.groupByMenu.down('[groupBy="' + group + '"]');

		if (item) {
			item.setChecked(true, true);
			this.groupEl.el.down('.label').update(item.text);
		}
	},


	setSearch: function (search) {
		if (!this.rendered) {
			this.searchKey = search;
			return;
		}

		this.searchEl.dom.value = search || '';
	},


	getFilterType: function () {

	},


	getSortBy: function () {
		return this.currentSort || 'active';
	},


	getSearch: function () {
		return this.searchKey || '';
	}
});
