Ext.define('NextThought.model.forums.Base',{
	extend: 'NextThought.model.Base',


	getContentsStoreId: function(){
		return this.get('Class')+'-'+this.get('NTIID');
	},


	buildContentsStore: function(cfg, extraParams){
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
				sortOn: 'CreatedTime',
				sortOrder: 'descending'
			}, extraParams));

		return store;
	},


	getParentHref: function(){
		var path = this.get('href');
		path = path.split('/');
		path.pop();
		return path.join('/');
	}
});
