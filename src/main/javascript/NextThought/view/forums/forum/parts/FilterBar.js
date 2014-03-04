Ext.define('NextThought.view.forums.forum.parts.FilterBar', {
	extend: 'Ext.Component',
	alias: 'widget.forums-forum-filterbar',
	ui: 'course-assessment',
	cls: 'forum-filterbar assignment-filterbar forum-body-header',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'third dropmenu disabled', cn: [
			{ cls: 'label', html: 'All Discussions' }
		] },
		{ cls: 'third dropmenu groupBy', cn: [
			{ cls: 'label', html: 'By Most Recent Activity' }
		] },
		{ cls: 'third search', cn: [
			{ tag: 'input', type: 'text', placeholder: 'Search Discussions', required: 'required' },
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
		this.currentSort = 'active';
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
			this.fireEvent('sorters-changed');
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
		this.groupByMenu.showBy(this.groupEl, 'tl-tl', this.groupByMenu.offset);
	},


	createGroupByMenu: function() {
		var type = this.currentSort,
			items = [
				{ text: 'By Most Recent Activity', groupBy: 'active', checked: type === 'active'},
				{ text: 'By Creation', groupBy: 'created', checked: type === 'created'},
				{ text: 'By Comment Count', groupBy: 'comment', checked: type === 'comment'},
				{ text: 'By Likes', groupBy: 'likes', checked: type === 'likes'}
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


	switchOrdering: function(item, status) {
		if (!status) { return; }
		var offset = item.getOffsetsTo(this.groupByMenu),
			x = offset && offset[1];

		this.groupEl.el.down('.label').update(item.text);

		this.groupByMenu.offset = [0, -x];

		this.currentSort = item.groupBy;
		this.fireEvent('sorters-changed');
	},


	getFilterType: function() {

	},


	getSortBy: function() {
		return this.currentSort || 'active';
	},


	getSearch: function() {
		return this.searchKey || '';
	}
});
