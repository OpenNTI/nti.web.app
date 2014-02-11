Ext.define('NextThought.model.forums.Base', {
	extend: 'NextThought.model.Base',

	requires: ['NextThought.util.Store'],

	getContentsStoreId: function() {
		return this.get('Class') + '-' + this.get('NTIID');
	},


	buildContentsStore: function(cfg, extraParams) {
		var store = NextThought.store.NTI.create(Ext.apply({
			storeId: this.getContentsStoreId(),
			url: this.getLink('contents'),
			sorters: [{
				property: 'CreatedTime',
				direction: 'DESC'
			}]
		}, cfg || {}));

		store.proxy.extraParams = Ext.apply(
			store.proxy.extraParams || {},
			Ext.apply({
				sortOn: 'createdTime',
				sortOrder: 'descending'
			}, extraParams));

		//Because the View is tied to the store and its events, any change to
		// records trigger a refresh. :)  So we don't have to impl. any special logic filling in. Just replace the
		// Creator string with the user model and presto!
		StoreUtils.fillInUsers(store);

		return store;
	},


	getParentHref: function() {
		var path = this.get('href');
		path = path.split('/');
		path.pop();
		return path.join('/');
	}
});
