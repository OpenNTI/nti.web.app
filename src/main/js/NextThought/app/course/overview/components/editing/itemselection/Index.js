Ext.define('NextThought.app.course.overview.components.editing.itemselection.Index', {
	extend: 'Ext.container.Container',
	//Shouldn't be instantiated, only extended

	requires: [
		'NextThought.app.course.overview.components.editing.itemselection.Item'
	],

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'title', html: '{title}'
	})),

	showSearch: true,
	multiSelect: false,
	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.selection = this.selectedItems || [];

		if (this.showSearch) {
			this.searchCmp = this.add({
				xtype: 'box',
				autoEl: {
					cls: 'search',
					cn: [
						{tag: 'span', cls: 'has-search', html: 'Search Results'},
						{cls: 'input-container', cn: [
							{tag: 'input', type: 'text', placeholder: 'Search or enter NTIID'},
							{tag: 'span', cls: 'clear', html: 'clear'},
							{tag: 'span', cls: 'do-search'}
						]}
					]
				},
				listeners: {
					click: {
						element: 'el',
						fn: this.onSearchClicked.bind(this)
					}
				}
			});
		}

		this.itemsContainer = this.add({
			xtype: 'container',
			cls: 'items',
			layout: 'none',
			items: []
		});

		if (this.selectionItems) {
			this.setSelectionItems(this.selectionItems);
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		var search = this.searchCmp;

		this.searchInput = search && search.el && search.el.dom && search.el.dom.querySelector('input');

		if (!this.itemSet) {
			this.el.mask('Loading...');
		}

		if (this.onSelectionChanged) {
			this.onSelectionChanged(this.selection);
		}

		this.searchInput.addEventListener('keyup', this.onSearchKeyUp.bind(this));
	},


	onSearchClicked: function(e) {
		if (e.getTarget('.clear')) {
			this.searchInput.value = '';
			this.searchForTerm('');
		} else if (e.getTarget('.do-search')) {
			this.onSearchKeyUp();
		}
	},


	onSearchKeyUp: function() {
		this.searchForTerm(this.searchInput.value);
	},


	searchForTerm: function(term) {
		this.itemsContainer.items.each(function(item) {
			item.applySearchTerm(term);
		});

		this.searchCmp[term ? 'addCls' : 'removeCls']('has-search-term');
	},


	setSelectionItems: function(items) {
		var me = this;

		me.selectionItems = items;
		me.itemsSet = true;

		me.itemsContainer.add(items.map(function(item) {
			return {
				xtype: 'overview-editing-item-selection-item',
				selectionItem: item,
				itemTpl: me.itemTpl,
				getItemData: me.getItemData.bind(me),
				getItemChildren: me.getItemChildren.bind(me),
				itemMatchesSearch: me.itemMatchesSearch.bind(me),
				multiSelect: me.multiSelect,
				selectItem: me.selectItem.bind(me),
				unselectItem: me.unselectItem.bind(me),
				onSelectItem: me.onSelectItem.bind(me),
				onUnselectItem: me.onUnselectItem.bind(me)
			};
		}));

		me.el.unmask();

		me.applySelection(me.selection);
	},


	applySelection: function(selection) {
		if (!Array.isArray(selection)) {
			selection = [selection];
		}

		this.itemsContainer.items.each(function(item) {
			if (item && item.maybeSelectItem) {
				selection.forEach(item.maybeSelectItem.bind(item));
			}
		});

		this.selection = selection;
	},


	getSelection: function() {
		return this.selection;
	},


	getItemData: function(item) {
		return {
			title: item.getTitle && item.getTitle()
		};
	},


	getItemChildren: function(item) {
		return [];
	},


	clearSelection: function() {
		this.selection.forEach(this.unselectItem.bind(this));
	},


	itemMatchesSearch: function(item, searchTerm) {
		var title = item.getTitle && item.getTitle();

		return title && title.indexOf(searchTerm) >= 0;
	},


	selectItem: function(selectionItem) {
		if (!this.multiSelect) { this.clearSelection(); }

		this.itemsContainer.items.each(function(item) {
			if (item && item.maybeSelectItem) {
				item.maybeSelectItem(selectionItem);
			}
		});

		this.selection.push(selectionItem);

		if (this.onSelectionChanged) {
			this.onSelectionChanged(this.selection);
		}
	},


	unselectItem: function(selectionItem) {
		this.itemsContainer.items.each(function(item) {
			if (item && item.maybeUnselectItem) {
				item.maybeUnselectItem(selectionItem);
			}
		});

		this.selection = this.selection.filter(function(item) {
			return item.getId() !== selectionItem.getId();
		});

		if (this.onSelectionChanged) {
			this.onSelectionChanged(this.selection);
		}
	},


	onSelectItem: function(el) {},
	onUnselectItem: function(el) {}
});
