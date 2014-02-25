Ext.define('NextThought.proxy.courseware.PageSource', {
	extend: 'NextThought.util.PageSource',

	statics: {

		 urlFrom: function(store) {
			 var px = store.getProxy(),
				 op = new Ext.data.Operation({
					 action: 'read',
					 filters: store.filters.items,
					 sorters: store.sorters.items
				 }),
				url;

			 op.params = px.getParams(op);
			 url = px.buildUrl(op);

			 return Ext.urlAppend(url, Ext.Object.toQueryString(op.params));
		 }

	},

	config: {
		idExtractor: Ext.identityFn,
		current: null,
		url: '',
		model: null
	},


	constructor: function(cfg) {
		this.initConfig(cfg);

		var getIdOf = this.getIdExtractor() || Ext.identityFn;

		this.url = Ext.urlAppend(this.url, Ext.Object.toQueryString({
			batchAround: getIdOf(this.current),
			batchSize: 3,
			batchStart: 0
		}));

		Service.request(this.url)
				.done(this.update.bind(this))
				.fail(function(reason) {
					console.error(reason);
				});
	},


	update: function(rep) {
		//FilteredTotalItemCount

	},


	getPageNumber: function() { return null; },


	getTotal: function() {
		return 0;
	}
});
