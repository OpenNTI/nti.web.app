const Ext = require('extjs');

const {isFeature} = require('legacy/util/Globals');
const Globals = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const StoreUtils = require('legacy/util/Store');
const ContextStateStore = require('legacy/app/context/StateStore');

const SearchStateStore = require('./StateStore');

require('legacy/common/Actions');


module.exports = exports = Ext.define('NextThought.app.search.Actions', {
	extend: 'NextThought.common.Actions',
	PAGE_SIZE: 10,

	USER_LIST_MIME_TYPE: 'application/vnd.nextthought.app.userlist',

	constructor: function () {
		this.callParent(arguments);

		this.SearchStore = SearchStateStore.getInstance();
		this.ContextStore = ContextStateStore.getInstance();
	},

	getPageSize: function () {
		return this.PAGE_SIZE;
	},

	__getSearchLocation: function () {
		var location = this.ContextStore.getReaderLocation(),
			NTIID = location && location.NTIID,
			currentNode = location && location.location;

		function isValidSearchNTIID (ntiid) {
			var data = lazy.ParseUtils.parseNTIID(ntiid);

			if (!data || (data.specific && data.specific.type === 'RelatedWorkRef')) { return false; }

			return true;
		}

		function isValidSearchNode (node) {
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

	async loadSearchPage (term, accepts, bundle, location, page, cachedHref) {
		var rootUrl = Service.getUserUnifiedSearchURL(),
			url, params;

		bundle = bundle && bundle.isModel ? bundle.getId() : bundle;
		location = location && location.isModel ? location.getId() : location;

		location = location || bundle || Globals.CONTENT_ROOT;

		url = cachedHref || [rootUrl, location, '/', term].join('');

		accepts = (accepts || []).map(function (mime) {
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

		let userList;

		if(page === 1) {
			const userSearchUrl = Service.getUserSearchURL(term);
			const users = await StoreUtils.loadRawItems(userSearchUrl).then(function (result) {
				return JSON.parse(result);
			});

			const userResults = users.Items ? users.Items.filter(x => x.Class === 'User') : [];

			userList = {
				TargetMimeType: this.USER_LIST_MIME_TYPE,
				Class: 'User',
				Items: userResults
			};
		}

		return StoreUtils.loadBatch(url, cachedHref ? {} : params, null, null, isFeature('use-new-search')).then((result) =>{
			if(result.Items && userList) {
				result.Items.push(userList);
			}
			return result;
		});

	},

	setSearchContext: function (term, silent) {
		var currentBundle = this.ContextStore.getRootBundle(),
			bundleId = currentBundle && currentBundle.getId(),
			loc = this.__getSearchLocation();

		this.SearchStore.setSearchContext(term, silent, bundleId, loc);
	},

	syncTerm: function (term) {
		this.SearchStore.fireEvent('sync-term', term);
	}
});
