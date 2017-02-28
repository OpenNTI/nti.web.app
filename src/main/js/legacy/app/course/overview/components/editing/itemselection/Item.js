var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.itemselection.Item', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-item-selection-item',


	cls: 'selection-item-container',
	layout: 'none',
	items: [],


	initComponent: function () {
		this.callParent(arguments);

		this.itemCmp = this.add({
			xtype: 'box',
			cls: 'selection-item',
			listeners: {
				click: {
					element: 'el',
					fn: this.onItemClick.bind(this)
				}
			}
		});

		if (this.getItemChildren) {
			this.addChildren();
		}
	},


	afterRender: function () {
		this.callParent(arguments);

		var data = this.getItemData(this.selectionItem);

		if (!data) {
			this.addCls('hidden');
		} else if (data instanceof Promise) {
			data.then(this.setItemData.bind(this));
		} else {
			this.setItemData(data);
		}
	},


	addChildren: function () {
		var me = this,
			children = me.getItemChildren(me.selectionItem);

		if (children && children.length) {
			me.childContainer = me.add({
				xtype: 'container',
				cls: 'selection-children',
				layout: 'none',
				items: children.map(function (child) {
					return {
						xtype: 'overview-editing-item-selection-item',
						selectionItem: child,
						itemTpl: me.itemTpl,
						getItemData: me.getItemData.bind(me),
						getItemChildren: me.getItemChildren && me.getItemChildren.bind(me),
						getSelectionItemId: me.getSelectionItemId,
						itemMatchesSearch: me.itemMatchesSearch.bind(me),
						multiSelect: me.multiSelect,
						selectItem: me.selectItem.bind(me),
						unselectItem: me.unselectItem.bind(me),
						onSelectItem: me.onSelectItem.bind(me),
						onUnselectItem: me.onUnselectItem.bind(me),
						onItemCollapse: me.onItemCollapse,
						onItemExpand: me.onItemExpand
					};
				})
			});
		}
	},


	setItemData: function (data) {
		this.itemTpl.append(this.itemCmp.el, data);

		this.hasItemData = true;
		this.fireEvent('item-data-set');
	},


	doExpand: function () {
		this.addCls('expanded');

		if (this.onItemExpand) {
			this.onItemExpand(this.selectionItem);
		}
	},


	doCollapse: function () {
		this.removeCls('expanded');

		if (this.onItemCollapse) {
			this.onItemCollapse(this.selectionItem);
		}
	},


	onItemClick: function (e) {
		if (e.getTarget('.expand')) {
			if (this.hasCls('expanded')) {
				this.doCollapse();
			} else {
				this.doExpand();
			}

			return;
		}

		if (!e.getTarget('.excluded')) {
			if (this.isSelected) {
				this.unselectItem(this.selectionItem);
			} else {
				this.selectItem(this.selectionItem);
			}
		}

		e.preventDefault();
		e.stopPropagation();
		return false;
	},


	unexclude: function (item) {
		if (this.hasItemData) {
			this.itemCmp.removeCls('excluded');
			this.itemCmp.el.dom.removeAttribute('data-qtip');
		}
	},


	maybeExclude: function (item) {
		if (!this.hasItemData) {
			this.on({
				single: true,
				'item-data-set': this.maybeExclude.bind(this, item)
			});

			return;
		}

		var id = typeof item === 'string' ? item : item.id,
			msg = item.msg,
			selectionItemId = this.getSelectionItemId(this.selectionItem);

		if (id === selectionItemId) {
			this.itemCmp.addCls('excluded');

			if (msg) {
				this.itemCmp.el.dom.setAttribute('data-qtip', msg);
			} else {
				this.itemCmp.el.dom.removeAttribute('data-qtip');
			}
		}
	},


	maybeSelectItem: function (item) {
		debugger;
		if (!this.hasItemData) {
			this.on({
				single: true,
				'item-data-set': this.maybeSelectItem.bind(this, item)
			});

			return;
		}

		var selectionItemId = this.getSelectionItemId(this.selectionItem),
			itemId = this.getSelectionItemId(item);

		if (selectionItemId && selectionItemId === itemId) {
			this.isSelected = true;
			this.onSelectItem(this.itemCmp.el.dom);
		}

		if (this.childContainer) {
			this.childContainer.items.each(function (child) {
				if (child && child.maybeSelectItem) {
					child.maybeSelectItem(item);
				}
			});
		}
	},


	maybeUnselectItem: function (item) {
		if (!this.hasItemData) {
			this.on({
				single: true,
				'item-data-set': this.maybeUnselectItem.bind(this, item)
			});

			return;
		}

		var selectionItemId = this.getSelectionItemId(this.selectionItem),
			itemId = this.getSelectionItemId(item);

		if (selectionItemId && selectionItemId === itemId) {
			this.isSelected = false;
			this.onUnselectItem(this.itemCmp.el.dom);
		}

		if (this.childContainer) {
			this.childContainer.items.each(function (child) {
				if (child && child.maybeUnselectItem) {
					child.maybeUnselectItem(item);
				}
			});
		}
	},


	applySearchTerm: function (term) {
		if (!term || !this.itemMatchesSearch || this.itemMatchesSearch(this.selectionItem, term)) {
			this.itemCmp.removeCls('filtered');
		} else {
			this.itemCmp.addCls('filtered');
		}

		if (this.childContainer) {
			this.childContainer.items.each(function (child) {
				if (child && child.applySearchTerm) {
					child.applySearchTerm(term);
				}
			});
		}
	}
});
