Ext.define('NextThought.store.Page',{
	extend: 'Ext.data.Store',
	model: 'NextThought.model.Page',
	proxy: {
		type: 'rest',
		reader: {
			type: 'json',
			root: 'Items'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json',
			'Content-Type': 'application/vnd.nextthought.page+json'
		},
		model: 'NextThought.model.Page'
	},

	load: function(){
		var collection = _AppConfig.service.getCollection('Pages');
		this.proxy.url = _AppConfig.server.host + collection.href;
		return this.callParent(arguments);
	},


	/**
	 *
	 * @param containerId
	 * @param linkRel
	 *
	 * @return {String/Boolean} A string of the URI, or false if the containerId was not in the store yet.
	 */
	getLink: function(containerId, linkRel){
		var page = this.getById(containerId);
		return page ? page.getLink(linkRel) : false;
	}
});
