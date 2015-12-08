Ext.define('NextThought.app.course.overview.components.editing.parentselection.Menu', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-parentselection-menu',

	requires: [
		'NextThought.app.course.overview.components.editing.parentselection.MenuItem',
		'NextThought.app.course.overview.components.editing.parentselection.NewItem'
	],

	cls: 'overview-editing-parentselection-menu',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'container',
				cls: 'item-list',
				isItemList: true,
				layout: 'none',
				items: []
			},
			{
				xtype: 'container',
				cls: 'new-item',
				isNewItem: true,
				layout: 'none',
				items: []
			}
		]);


		this.itemListContainer = this.down('[isItemList]');
		this.newItemContainer = this.down('[isNewItem]');

		this.showItems();
	},


	doSelectRecord: function() {},


	selectRecord: function(record) {
		this.itemListContainer.items.each(function(item) {
			if (item.selectRecord) {
				item.selectRecord(record);
			}
		});
	},


	showItems: function() {
		this.itemListContainer.removeAll(true);

		var itemTpl = this.itemTpl,
			doSelectRecord = this.doSelectRecord.bind(this),
			parseItemData = this.parseItemData,
			items;

		items = this.selectionItems.map(function(item) {
			return {
				xtype: 'overview-editing-parentselection-menuitem',
				selectionRecord: item,
				itemTpl: itemTpl,
				parseItemData: parseItemData,
				doSelectRecord: doSelectRecord
			};
		});

		if (this.editor) {
			items.push({
				xtype: 'box',
				autoEl: {
					cls: 'new-item parentselection-menuitem', html: this.editor.creationText || 'Add New Item'
				},
				listeners: {
					click: {
						element: 'el',
						fn: this.showAddNewItem.bind(this)
					}
				}
			});
		}

		this.itemListContainer.add(items);

		this.itemListContainer.show();
		this.newItemContainer.hide();
	},


	showAddNewItem: function() {
		this.newItemContainer.removeAll(true);

		this.newItemContainer.add({
			xtype: 'overview-editing-parentselection-newitem',
			editor: this.editor,
			parentRecord: this.parentRecord,
			afterCreation: this.afterCreation.bind(this),
			onBack: this.showItems.bind(this)
		});

		this.newItemContainer.show();
		this.itemListContainer.hide();
	},


	afterCreation: function() {}
});
