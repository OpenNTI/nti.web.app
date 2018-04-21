const Ext = require('@nti/extjs');
require('legacy/app/library/courses/components/Page');
require('legacy/app/library/components/Collection');


module.exports = exports = Ext.define('NextThought.app.library.content.components.Page', {
	extend: 'NextThought.app.library.courses.components.Page',
	alias: 'widget.library-view-book-page',

	initComponent: function () {
		this.callParent(arguments);

		this.setBooks(this.bundles, this.packages);
	},

	//Override this so the parent doesn't think its empty
	setItems: function () {},

	setBooks: function (bundles, packages) {
		if (!this.store) {
			this.buildStore();
		}

		if (!bundles.length && !packages.length) {
			this.showEmptyText();
			return;
		}

		this.store.removeAll();
		this.store.loadRecords(bundles, {addRecords: true});
		this.store.loadRecords(packages, {addRecords: true});

		this.add({
			xtype: 'library-collection',
			store: this.store,
			navigate: this.navigate.bind(this)
		});
	},

	buildStore: function () {
		this.store = Ext.data.Store.create({
			model: 'NextThought.model.ContentBundle'
		});
	}
});
