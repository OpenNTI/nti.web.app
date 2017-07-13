const Ext = require('extjs');


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
				},
				mouseover: {
					element: 'el',
					fn: this.onItemHover.bind(this)
				},
				mouseout: {
					element: 'el',
					fn: this.onItemMouseOut.bind(this)
				}
			}
		});

		if (this.getItemChildren) {
			this.addChildren();
		}

		if (this.selectionItem.isModel) {
			this.mon(this.selectionItem, 'update', x => this.onSelectionItemUpdated(x));
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
						onItemExpand: me.onItemExpand,
						isItemDisabled: me.isItemDisabled
					};
				})
			});
		}
	},


	onSelectionItemUpdated () {
		if (this.itemCmp && this.itemCmp.el && this.itemCmp.el.dom) {
			this.itemCmp.el.dom.innerHTML = '';
		}

		var data = this.getItemData(this.selectionItem);

		if (!data) {
			this.addCls('hidden');
		} else if (data instanceof Promise) {
			data.then(this.setItemData.bind(this));
		} else {
			this.setItemData(data);
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
		const editLink = e.getTarget('.edit-link');

		if (this.isItemDisabled && this.isItemDisabled(this.selectionItem, e)) {
			return;
		}

		if (e.getTarget('.expand')) {
			if (this.hasCls('expanded')) {
				this.doCollapse();
			} else {
				this.doExpand();
			}

			return;
		}

		if (!e.getTarget('.excluded')) {
			if (!editLink) {
				if (this.isSelected) {
					this.unselectItem(this.selectionItem);
				} else {
					this.selectItem(this.selectionItem);
				}
			} else {
				const ntiid = editLink.getAttribute('data-ntiid');
				const container = this.up('overview-editing-video-item-selection');
				if (container && container.editItem) {
					container.editItem(ntiid);
				}
			}
		}

		e.preventDefault();
		e.stopPropagation();
		return false;
	},


	onItemMouseOut: function (e) {
		const editLink = this.el.down('.edit-link');
		if (!editLink) {
			return;
		}

		editLink.removeCls('show');
	},


	onItemHover: function () {
		const editLink = this.el.down('.edit-link');
		if (!editLink) {
			return;
		}

		editLink.addCls('show');
	},


	unexclude: function () {
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
