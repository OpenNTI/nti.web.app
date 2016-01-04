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

		var me = this;

		me.add([
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

		me.itemListContainer = me.down('[isItemList]');
		me.newItemContainer = me.down('[isNewItem]');

		if (me.selectionItems.length === 1) {
			wait()
				.then(function() {
					me.disable();
					me.doSelection(me.selectionItems[0]);
				});
		} if (me.selectionItems.length) {
			me.showItems();
		} else if (me.editor) {
			me.showAddNewItem();
		}
	},


	onHide: function() {
		if (this.selectionItems.length) {
			this.showItems();
		} else {
			this.showAddNewItem();
		}
	},


	doSelection: function(record) {
		if (this.doSelectRecord) {
			this.doSelectRecord(record);
		}

		this.close();
	},


	selectRecord: function(record) {
		this.selectedRecord = record;

		this.itemListContainer.items.each(function(item) {
			if (item.selectRecord) {
				item.selectRecord(record);
			}
		});
	},


	getSelection: function() {
		return this.selectedRecord;
	},


	showItems: function() {
		this.itemListContainer.removeAll(true);

		var itemTpl = this.itemTpl,
			doSelection = this.doSelection.bind(this),
			parseItemData = this.parseItemData,
			items;

		items = this.selectionItems.map(function(item) {
			return {
				xtype: 'overview-editing-parentselection-menuitem',
				selectionRecord: item,
				itemTpl: itemTpl,
				parseItemData: parseItemData,
				doSelection: doSelection
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

		if (this.selectedRecord) {
			this.selectRecord(this.selectedRecord);
		}

		this.itemListContainer.show();
		this.newItemContainer.hide();
	},


	showAddNewItem: function() {
		this.newItemContainer.removeAll(true);

		this.newItemContainer.add({
			xtype: 'overview-editing-parentselection-newitem',
			editor: this.editor,
			hasOtherItems: this.selectionItems.length > 0,
			parentRecord: this.parentRecord,
			afterCreation: this.afterCreation.bind(this),
			onBack: this.showItems.bind(this)
		});

		this.newItemContainer.show();
		this.itemListContainer.hide();
	},


	afterCreation: function(record) {
		this.showItems();
		this.doSelection(record);
	}
});
