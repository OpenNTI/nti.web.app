/**
 * This stream DOES NOT support random access to any
 * page.  It uses the optimized batchBefore parameter
 * meaning we can load the first page, or the next page.
 * with a bit of calculation we could support previous page.
 * With a bit more calculation we could theoretically support
 * random access to pages 1 - (n-1) where n is the number of
 * pages currently loaded in the store.
 *
 * As currently implemented loadPage will thow an error if
 * called with values other 1 or n+1.  previousPage will also throw
 * an error.
 *
 * Luckily we currently don't need random access.  Loading
 * the first page and successive pages (as the user scrolls back in time) is enough.
 */

Ext.define('NextThought.store.Stream',{
	extend: 'Ext.data.Store',
	requires:[
		'NextThought.proxy.reader.Json'
	],

	model: 'NextThought.model.Change',

	autoLoad: false,
	pageSize: 100,

	proxy: {
		type: 'rest',
		limitParam: 'batchSize',
		pageParam: undefined,
		startParam: 'batchBefore',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'FilteredTotalItemCount'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		},
		model: 'NextThought.model.Change',

		getParams: function(){
			//Better way? (we basically want callparent but we are replacing instead of
			//overriding
			var p = this.self.prototype.getParams.apply(this, arguments);

			Ext.Object.each(p, function(k, v, o){
				if(v === undefined || v === null){
					delete o[k];
				}
			});

			return p;
		}
	},

	groupField: 'EventTime',

	//Note this matches the default sort order
	//that we get when we request things on the ds
	sorters: [
		{
			property : 'Last Modified',
			direction: 'DESC'
		}
	],

	/**
	 * Like last but doesn't include any filtering
	 */
	unfilteredLast: function(){
		if(this.snapshot){
			return this.snapshot.last();
		}
		return this.last();
	},


	hasAdditionalPagesToLoad: function(){
		return this.mayHaveAdditionalPages === undefined || this.mayHaveAdditionalPages;
	},


	previousPage: function(){
		Ext.Error.raise('previousPage not supported for stream store');
	},


	loadPage: function(page, options){
		if(page !== 1 && page !== this.currentPage + 1){
			Ext.Error.raise('loadPage can only be called for page 1 or n + 1 where n is currentPage');
		}

		var before, last;

		//For the first page before is 0 (that means now).
		//The value of before for page n+1 is the last items
		//lastMod time
		if(page !== 1){
			last = this.unfilteredLast();
			if(last && last.get('Last Modified')){
				before = last.get('Last Modified') / 1000;
			}
		}

		options = Ext.apply({
			start: before
		}, options);

		this.callParent([page, options]);
	},

	load: function(options){
		options = Ext.applyIf(options || {}, {start: null});

		function isMoreDetector(records, operation, success){
			//Set some state that indicates if we may have more

			//If we fail with a 404 we treat that as no more
			if(!success && operation.response && operation.response.status === 404){
				this.mayHaveAdditionalPages = false;
			}
			else{
				this.mayHaveAdditionalPages = (!success || operation.limit === undefined || records.length === operation.limit);
			}


			console.log('Load finished.  Do we have additional pages', this.mayHaveAdditionalPages);
		}

		options.callback = Ext.Function.createSequence(isMoreDetector, options.callback, this);

		this.callParent([options]);
	}
});
