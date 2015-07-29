Ext.define('NextThought.app.sharing.components.ShareSearch', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-sharesearch',

	floating: true,

	requires: [
		'NextThought.app.sharing.components.ShareSearchList'
	],

	cls: 'share-search-container',
	layout: 'none',

	items: [],


	afterRender: function() {
		this.callParent(arguments);

		this.searchList = this.add({
			xtype: 'share-search',
			ownerCls: this.ownerCls,
			loadMaskContainer: this.el,
			selectItem: this.selectItem.bind(this)
		});

		if (this.store) {
			this.searchList.bindStore(this.store);
		}
	},


	bindStore: function(store) {
		this.store = store;

		if (this.searchList) {
			this.searchList.bindStore(store);
		}
	},


	refresh: function() {
		if (this.searchList) {
			this.searchList.refresh();
		}
	},


	getNode: function(index) {
		if (this.searchList) {
			return this.searchList.getNode(index);
		}
	}
});
