Ext.define('NextThought.view.library.BookPage', {
	extend: 'NextThought.view.library.CoursePage',
	alias: 'widget.library-view-book-page',

	requires: [
		'NextThought.view.library.Collection'
	],

	initComponent: function() {
		this.callParent(arguments);

		this.setBookStore(this.books);
	},

	setBookStore: function(store) {
		if (Ext.isEmpty(store) || !store.getCount()) {
			this.showEmptyText();
			return;
		}

		this.removeAll(true);
		this.add({
			xtype: 'library-collection',
			store: store
		});
	}
});
