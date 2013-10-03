Ext.define('NextThought.store.Library', {
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.model.Title'
	],
	model: 'NextThought.model.Title',

	buffered: false,
	clearOnPageLoad: true,
	clearRemovedOnLoad: true,
	sortOnLoad: true,
	statefulFilters: false,
	remoteSort: false,
	remoteFilter: false,
	remoteGroup: false,
	filterOnLoad: true,
	sortOnFilter: true,

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
			root: 'titles'
		},
		noCache: true,

		//Don't send any params with this store load.
	    groupParam: undefined,
	    groupDirectionParam: undefined,
	    sortParam: undefined,
	    filterParam: undefined,
	    directionParam: undefined,
	    idParam: undefined,
		//When we start paging the library, we will define these
		pageParam: undefined,
	    startParam: undefined,
	    limitParam: undefined
	},
	sorters: [
		{
			sorterFn: function(a, b) {
				if (/nextthought/i.test(a.get('author'))) {
					return 1;
				}
				if (/nextthought/i.test(b.get('author'))) {
					return -1;
				}
				return 0;
			}
		},{
			property: 'title',
			direction: 'asc'
		}
	],


	constructor: function() {
		this.callParent(arguments);
		this.on('beforeload', 'onBeforeLoad');
	},


	onBeforeLoad: function() {
		if (this.proxy instanceof Ext.data.proxy.Server) {//don't resolve the url if we're a memory proxy
			try {
				this.proxy.url = getURL($AppConfig.service.getMainLibrary().href);
			}
			catch (e) {
				console.error(e.message, e.stack || e.stacktrace || e);
			}
		}
	},


	each: function(fn, scope, ignoreFilter) {
		var filtered = null;
		if (this.isFiltered() && ignoreFilter) {
			filtered = this.data;
			this.data = this.snapshot;
		}

		try {
			return this.callParent([fn, scope]);
		}
		finally {
			if (filtered) {
				this.data = filtered;
			}
		}
	},


	findRecord: function(property, value, start, anyMatch, caseSensitive, exactMatch, ignoreFilter) {
		var filtered = null;
		if (this.isFiltered() && ignoreFilter) {
			filtered = this.data;
			this.data = this.snapshot;
		}

		try {
			return this.callParent([property, value, start, anyMatch, caseSensitive, exactMatch]);
		}
		finally {
			if (filtered) {
				this.data = filtered;
			}
		}
	},


	first: function(grouped, ignoreFilter) {
		var filtered = null;
		if (this.isFiltered() && ignoreFilter) {
			filtered = this.data;
			this.data = this.snapshot;
		}

		try {
			return this.callParent([grouped]);
		}
		finally {
			if (filtered) {
				this.data = filtered;
			}
		}
	}
});
