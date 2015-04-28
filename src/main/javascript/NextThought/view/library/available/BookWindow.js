Ext.define('NextThought.view.library.available.BookWindow', {
	extend: 'NextThought.view.library.available.CourseWindow',
	alias: 'widget.library-available-books-window',

	label: 'Add Books',

	cls: 'available-books',

	requires: ['NextThought.view.store.Collection'],

	items: [{
		xtype: 'purchasable-collection'
	}],

	initComponent: function() {
		this.callParent(arguments);

		this.collection = this.down('purchasable-collection');
		this.getLayout().setActiveItem(this.collection);

		this.collection.bindStore(this.store);
	},


	setItems: function(store) {
		if (this.collection.store) {
			this.collection.store.loadRecords(store.getRange());
		} else {
			this.collection.bindStore(store);
		}
	}
});
