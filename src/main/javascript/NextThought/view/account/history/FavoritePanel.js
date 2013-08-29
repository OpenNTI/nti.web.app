Ext.define('NextThought.view.account.history.FavoritePanel', {
	extend: 'NextThought.view.account.history.Panel',
	alias:  'widget.user-history-favorite-panel',

	requires: [
		'NextThought.model.events.Bus'
	],

	storeId:  'favoriteStore',
	grouping: 'GroupingField',
	filter:   'Bookmarks',

	getMimeTypes: function () {
		return [];
	},


	buildStore: function () {
		this.callParent(arguments);

		NextThought.model.events.Bus.on({
											scope:              this,
											'favorite-changed': function (rec) {
												var store = this.getStore(),
														record;

												if (store.isLoading()) {
													return;
												}

												if (rec.isFavorited()) {
													store.insert(0, rec);
													store.sort();
												}
												else {
													//Do not use the PageItem store's remove() implementation. This is a simple store levaraging
													// the PageItem's loading/url logic. (So call the base class's remove)
													record = store.findRecord('NTIID', rec.get('NTIID'), 0, false, true, true);
													if (record) {
														this.removeBookmark(store, record);
													}
												}
											}
										});
	},

	removeBookmark: function (store, record) {
		//Ext.data.Store.prototype.remove.call(store,record);
		store.remove(record);
	}
});