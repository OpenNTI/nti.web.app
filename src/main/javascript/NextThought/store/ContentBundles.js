Ext.define('NextThought.store.ContentBundles', {
	extend: 'Ext.data.Store',
	requires: ['NextThought.util.Promise'],
	model: 'NextThought.model.ContentBundle',
	proxy: {
		type: 'ajax',
		timeout: 3600000,//hour
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json',
			'Content-Type': 'application/json'
		},
		url: 'tbd',
		reader: {
			type: 'json',
			root: 'Items'
		},

		noCache: false,

		//Don't send any params with this store load.
		groupParam: undefined,
		groupDirectionParam: undefined,
		sortParam: undefined,
		filterParam: undefined,
		directionParam: undefined,
		idParam: undefined,
		//When we start paging, we will define these
		pageParam: undefined,
		startParam: undefined,
		limitParam: undefined
	},

	constructor: function() {
		var p = this.promiseToLoaded = new Deferred(),
				me = this;
		this.callParent(arguments);
		this.on({
			scope: this,
			beforeload: function() {
				var old = p;
				p = me.promiseToLoaded = new Deferred();
				p.chain(old);
			},

			load: function(me, records, success) {
				if (!success) {
					p.reject('Store Failed to load');
					return;
				}
				p.fulfill(me);
			}
		});
	},


	destroy: function() {
		this.destroyed = true;
		this.removeAll(true);
		this.promiseToLoaded.fulfill(this);
	},


	onceLoaded: function() {
		return this.promiseToLoaded;
	}


});
