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
		this.mixins.observable.constructor.call(this);
		this.initConfig(cfg);
		this.addEvents({
			update: true
		});

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


	update: function(reply) {
		var rawTotal = 'TotalItemCount',
			total = 'Filtered' + rawTotal;

		reply = Ext.decode(reply, true) || {};

		this.total = reply.hasOwnProperty(total) ? reply[total] :
					 reply.hasOwnProperty(rawTotal) ? reply[rawTotal] :
					 null;

		//todo: fill in next/prev from results
		// The docs say batchAround(Creator) should put the id in the
		// middle of the batch, if it can.  We set the batch size
		// specifically to three. So in all but the edge cases the item
		// we are "currently" at is in the middle, and the next/prevous
		// items are on either side.

		//BUG: on inital inspection the 'current' item, the one we are
		// batching around is not in the result.


		this.fireEvent('update', this);
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
