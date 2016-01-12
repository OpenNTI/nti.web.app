Ext.define('NextThought.app.course.overview.components.editing.itemselection.Item', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-item-selection-item',


	layout: 'none',
	items: [],


	initComponent: function() {
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

		//TODO: see if there are children
	},


	afterRender: function() {
		this.callParent(arguments);

		var data = this.getItemData(this.selectionItem);

		if (data instanceof Promise) {
			data.then(this.setItemData.bind(this));
		} else {
			this.setItemData(data);
		}
	},


	setItemData: function(data) {
		this.itemTpl.append(this.itemCmp.el, data);
	},


	onItemClick: function(e) {
		if (this.isSelected) {
			this.unselectItem(this.selectionItem);
		} else {
			this.selectItem(this.selectionItem);
		}

		e.preventDefault();
		e.stopPropagation();
		return false;
	},


	maybeSelectItem: function(item) {
		if (this.selectionItem.getId() === item.getId()) {
			this.isSelected = true;
			this.onSelectItem(this.itemCmp.el.dom);
		}
	},


	maybeUnselectItem: function(item) {
		if (this.selectionItem.getId() === item.getId()) {
			this.isSelected = false;
			this.onUnselectItem(this.itemCmp.el.dom);
		}
	}
});
