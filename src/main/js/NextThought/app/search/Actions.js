Ext.define('NextThought.app.search.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.search.StateStore',
		'NextThought.app.context.StateStore'
	],

	PAGE_SIZE: 10,

	constructor: function() {
		this.callParent(arguments);

		this.SearchStore = NextThought.app.search.StateStore.getInstance();
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},


	__getSearchLocation: function() {
		var location = this.ContextStore.getReaderLocation(),
			NTIID = location && location.NTIID,
			currentNode = location && location.location;

		function isValidSearchNTIID(ntiid) {
			var data = ParseUtils.parseNTIID(ntiid);

			if (!data || (data.specific && data.specific.type === 'RelatedWorkRef')) { return false; }

			return true;
		}

		function isValidSearchNode(node) {
			return node.tagName === 'topic';
		}

		while (!isValidSearchNTIID(NTIID) && currentNode) {
			if (isValidSearchNode(currentNode)) {
				NTIID = currentNode.getAttribute('href');
			}

			currentNode = currentNode.parentNode;
		}

		return NTIID;
	},


	loadSearchPage: function(term, accepts, bundle, location, page) {
		var rootUrl = Service.getUserUnifiedSearchURL(),
			url, params;

		bundle = bundle && bundle.isModel ? bundle.getId() : bundle;
		location = location && location.isModel ? location.getId() : location;

		location = location || bundle || Globals.CONTENT_ROOT;

		url = [rootUrl, location, '/', term].join('');

		accepts = (accepts || []).map(function(mime) {
			return 'application/vnd.nextthought.' + mime;
		});

		params = {
			sortOn: 'relevance',
			sortOrder: 'descending',
			accept: accepts.join(','),
			batchSize: this.PAGE_SIZE,
			batchStart: (page - 1) * this.PAGE_SIZE
		};

		if (accepts && accepts.length) {
			params.accept = accepts.join(',');
		}

		if (bundle) {
			params.course = bundle;
		}

		return StoreUtils.loadBatch(url, params);
	},


	setSearchContext: function(term) {
		var currentBundle = this.ContextStore.getRootBundle(),
			bundleId = currentBundle && currentBundle.getId(),
			loc = this.__getSearchLocation();

		this.SearchStore.setSearchContext(term, bundleId, loc);
	},


	syncTerm: function(term) {
		this.SearchStore.fireEvent('sync-term', term);
	}
});
