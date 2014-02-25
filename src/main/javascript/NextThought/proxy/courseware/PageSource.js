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
		model: null,
		batchAroundParam: 'batchAround'
	},


	constructor: function(cfg) {
		this.initConfig(cfg);

		var getIdOf = this.getIdExtractor() || Ext.identityFn,
			p = {
				batchSize: 3,
				batchStart: 0
			};

		p[this.getBatchAroundParam()] = getIdOf(this.current);

		this.url = Ext.urlAppend(this.url, Ext.Object.toQueryString(p));

		Service.request(this.url)
				.done(this.update.bind(this))
				.fail(function(reason) {
					console.error(reason);
				});
	},


	update: function(rep) {
		var rawTotal = 'TotalItemCount',
			total = 'Filtered' + rawTotal;

		rep = Ext.decode(rep, true) || {};

		this.total = rep.hasOwnProperty(total) ? rep[total] :
					 rep.hasOwnProperty(rawTotal) ? rep[rawTotal] :
					 null;

		//todo: fill in next/prev from results


	},


	//we do not care about the actual page number.
	// The consumers of this function should expect
	// that it might return null.
	getPageNumber: function() { return null; },

	getNext: function() { return this.next || null; },
	getPrevious: function() { return this.previous || null; },
	getTotal: function() { return this.total || ''; },
	hasNext: function() { return !!this.next; },
	hasPrevious: function() { return !!this.previous; }
});
