var Ext = require('extjs');
var ItemselectionItem = require('./Item');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.itemselection.Index', {
	extend: 'Ext.container.Container',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'title', html: '{title}'
	})),

	showSearch: true,
	multiSelect: false,
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		var headerCmps = [];

		this.selection = this.selectedItems || [];

		if (this.showSearch) {
			this.searchCmp = this.add({
				xtype: 'box',
				autoEl: {
					cls: 'search',
					cn: [
						{tag: 'span', cls: 'has-search', html: 'Search Results'},
						{cls: 'input-container', cn: [
							{tag: 'input', type: 'text', placeholder: 'Search'},
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

		if (this.getHeaderCfg && this.getHeaderCfg()) {
			this.headerCmp = this.add(this.getHeaderCfg());
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

	afterRender: function () {
		this.callParent(arguments);

		var search = this.searchCmp;

		this.searchInput = search && search.el && search.el.dom && search.el.dom.querySelector('input');

		if (!this.itemsSet) {
			this.el.mask('Loading...');
		}

		if (this.onSelectionChanged) {
			this.onSelectionChanged(this.selection);
		}

		this.searchInput.addEventListener('keyup', this.onSearchKeyUp.bind(this));
	},

	onSearchClicked: function (e) {
		if (e.getTarget('.clear')) {
			this.clearSearch();
		} else if (e.getTarget('.do-search')) {
			this.onSearchKeyUp();
		}
	},

	clearSearch: function () {
		if (!this.rendered) { return; }

		this.searchInput.value = '';
		this.searchForTerm('');
	},

	onSearchKeyUp: function () {
		this.searchForTerm(this.searchInput.value);
	},

	searchForTerm: function (term) {
		this.itemsContainer.items.each(function (item) {
			item.applySearchTerm(term);
		});

		if (this.onSearchCleared && !term && this.hasCls('has-search-term')) {
			this.onSearchCleared();
		}


		this[term ? 'addCls' : 'removeCls']('has-search-term');
	},


	getConfigForItem (item) {
		return {
			xtype: 'overview-editing-item-selection-item',
			selectionItem: item,
			itemTpl: this.itemTpl,
			getItemData: this.getItemData.bind(this),
			getItemChildren: this.getItemChildren && this.getItemChildren.bind(this),
			getSelectionItemId: this.getSelectionItemId.bind(this),
			itemMatchesSearch: this.itemMatchesSearch.bind(this),
			multiSelect: this.multiSelect,
			selectItem: this.selectItem.bind(this),
			unselectItem: this.unselectItem.bind(this),
			onSelectItem: this.onSelectItem.bind(this),
			onUnselectItem: this.onUnselectItem.bind(this),
			onItemExpand: this.onItemExpand.bind(this),
			onItemCollapse: this.onItemCollapse.bind(this),
			isItemDisabled: this.isItemDisabled.bind(this)
		};
	},


	setSelectionItems: function (items) {
		var me = this;

		if (!items || items.length === 0) {
			this.showEmptyState();
		}

		me.itemsContainer.removeAll(true);
		me.selectionItems = items;
		me.itemsSet = true;

		me.itemsContainer.add(items.map(x => me.getConfigForItem(x)));

		if (me.rendered) {
			me.el.unmask();
		}

		me.applySelection(me.selection);
	},


	addSelectionItem (item, select) {
		this.selectionItems = [item, ...this.selectionItems];

		this.itemsContainer.insert(0, this.getConfigForItem(item));

		if (select) {
			this.selectItem(item);
		}
	},


	updateSelectionItem (updatedItem) {
		const updatedItemId = updatedItem.ntiid || updatedItem.NTIID;

		this.setSelectionItems(this.selectionItems.map(x => {
			const id = x.ntiid || x.NTIID || x.internalId;
			return id === updatedItemId
				? Object.assign(x, {data: updatedItem, raw: updatedItem})
				: x;
		}));

		this.excludeItems(this.getExcludedVideos() || []);
	},


	excludeItems: function (exclude) {
		if (!Array.isArray(exclude)) {
			exclude = [exclude];
		}

		this.itemsContainer.items.each(function (item) {
			if (item && item.maybeExclude) {
				exclude.forEach(item.maybeExclude.bind(item));
			}
		});
	},

	showEmptyState: function () {},

	applySelection: function (selection) {
		if (!Array.isArray(selection)) {
			selection = [selection];
		}

		this.itemsContainer.items.each(function (item) {
			if (item && item.maybeSelectItem) {
				selection.forEach(item.maybeSelectItem.bind(item));
			}
		});

		this.selection = selection;

		//NTI-1288: Set the min height due to the height changing after searching
		if (this.rendered) {
			this.setMinHeight(this.getHeight());
		}
	},

	getSelection: function () {
		return this.selection;
	},

	isSelected: function (item) {
		var me = this,
			itemId = me.getSelectionItemId(item),
			selection = me.getSelection();

		return selection.reduce(function (acc, item) {
			if (me.getSelectionItemId(item) === itemId) {
				acc = true;
			}

			return acc;
		}, false);
	},


	isItemDisabled () {
		return false;
	},


	getItemData: function (item) {
		return {
			title: item.getTitle && item.getTitle()
		};
	},

	clearSelection: function () {
		this.selection.forEach(this.unselectItem.bind(this));
	},

	itemMatchesSearch: function (item, searchTerm) {
		var title = item.getTitle && item.getTitle();

		return title && title.indexOf(searchTerm) >= 0;
	},

	getSelectionItemId: function (item) {
		return item.getId
			? item.getId()
			: item.get
				? item.get('ntiid') || item.get('NTIID')
				: item.ntiid || item.NTIID;
	},

	selectItem: function (selectionItem) {
		if (!this.multiSelect) { this.clearSelection(); }

		this.itemsContainer.items.each(function (item) {
			if (item && item.maybeSelectItem) {
				item.maybeSelectItem(selectionItem);
			}
		});

		this.selection.push(selectionItem);

		if (this.onSelectionChanged) {
			this.onSelectionChanged(this.selection);
		}
	},

	unselectItem: function (selectionItem) {
		var me = this;

		me.itemsContainer.items.each(function (item) {
			if (item && item.maybeUnselectItem) {
				item.maybeUnselectItem(selectionItem);
			}
		});

		me.selection = me.selection.filter(function (item) {
			return me.getSelectionItemId(item) !== me.getSelectionItemId(selectionItem);
		});

		if (me.onSelectionChanged) {
			me.onSelectionChanged(this.selection);
		}
	},

	setMinHeight (height) {
		if(this.el && this.el.dom) {
			this.el.dom.style.minHeight = `${height}px`;
		}
	},

	onSelectItem: function (el) {},
	onUnselectItem: function (el) {},
	onItemExpand: function (item) {},
	onItemCollapse: function (item) {}
});
