var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var StoreUtils = require('../../util/Store');
var MixinsRouter = require('../../mixins/Router');
var LibraryActions = require('../library/Actions');
var NavigationActions = require('../navigation/Actions');
var SearchStateStore = require('./StateStore');
var ComponentsAdvancedOptions = require('./components/AdvancedOptions');
var ComponentsResults = require('./components/Results');
const { encodeForURI, decodeFromURI } = require('nti-lib-ntiids');

module.exports = exports = Ext.define('NextThought.app.search.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-index',

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	layout: 'none',

	initComponent: function () {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'search-advanced-menu',
				changeFilter: this.changeFilter.bind(this)
			},
			{
				xtype: 'search-results',
				navigateToSearchHit: this.navigateToSearchHit.bind(this)
			}
		]);

		this.LibraryActions = NextThought.app.library.Actions.create();
		this.NavActions = NextThought.app.navigation.Actions.create();
		this.SearchActions = NextThought.app.search.Actions.create();
		this.SearchStore = NextThought.app.search.StateStore.getInstance();

		this.initRouter();

		this.addRoute('/', this.showSearch.bind(this));

		this.addDefaultRoute('/');

		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this)
		});

		this.onContextUpdate = this.onContextUpdate.bind(this);

		this.OptionMenu = this.down('search-advanced-menu');
		this.Results = this.down('search-results');
	},

	getActiveItem: function () {
		return this.Results;
	},

	onActivate: function () {
		this.isActive = true;

		this.mon(this.SearchStore, 'context-updated', this.onContextUpdate);
	},

	onDeactivate: function () {
		this.isActive = false;

		this.mun(this.SearchStore, 'context-updated', this.onContextUpdate);
		this.clearResults();
	},

	updateRoute: function () {
		var search = this.currentSearch,
			term = search.term,
			filter = search.filter,
			page = search.page,
			bundle = search.bundle,
			query = {};

		query.q = encodeURIComponent(term);

		if (filter) {
			query.f = encodeURIComponent(filter);
		}

		if (page) {
			query.p = encodeForURI(page);
		}

		if (bundle) {
			query.s = encodeForURI(bundle);
		}

		query = Ext.Object.toQueryString(query);

		this.replaceRoute('Search', '/?' + query);
	},

	showSearch: function (route, subRoute) {
		var navActions = this.NavActions,
			params = route.queryParams,
			term = params.q,
			bundle = params.s,
			page = params.p,
			filter = params.f;

		this.NavActions.updateNavBar({
			hideBranding: true,
			noRouteOnSearch: true
		});

		this.setTitle('Search');

		term = term && decodeURIComponent(term);
		bundle = bundle && decodeFromURI(bundle);
		page = page && decodeFromURI(page);
		filter = filter && decodeURIComponent(filter);

		if (term) {
			this.SearchActions.syncTerm(term);
		}

		if (!bundle) {
			this.NavActions.setActiveContent(null);
		} else {
			this.LibraryActions.findBundle(bundle)
				.then(function (bundle) {
					navActions.setActiveContent(bundle, true);
				});
		}

		this.currentSearch = {
			term: term,
			bundle: bundle,
			page: page,
			filter: filter || 'all'
		};

		if (!this.isActive) {
			this.onActivate();
		}

		this.doNewSearch();

		return Promise.resolve();
	},

	onContextUpdate: function () {
		var term = this.SearchStore.getTerm();

		if (this.currentSearch.term === term) {
			return;
		}

		this.currentSearch.term = term;

		this.updateRoute();
	},

	changeFilter: function (filter) {
		if (this.currentSearch.filter === filter) {
			return;
		}

		this.currentSearch.filter = filter;

		this.updateRoute();
	},

	doNewSearch: function () {
		if (!this.currentSearch) { return; }

		this.clearResults();

		this.loadSearchPage(1);
	},

	clearResults: function () {
		this.Results.removeResults();
	},

	getAcceptFilter: function (filter) {
		return this.OptionMenu.getMimeTypes(filter);
	},

	showLoading: function () {
		this.Results.showLoading();
	},

	removeLoading: function () {
		this.Results.removeLoading();
	},

	showError: function () {
		this.Results.showError();
	},

	showNext: function () {
		this.Results.showNext(this.loadNextPage.bind(this));
	},

	removeNext: function () {
		this.Results.removeNext();
	},

	showEmpty: function () {
		this.Results.showEmpty();
	},

	loadSearchPage: function (page) {
		var search = this.currentSearch,
			accepts = this.getAcceptFilter(search.filter);

		this.showLoading();

		this.lock = Date.now();

		this.SearchActions.loadSearchPage(search.term, accepts, search.bundle, search.page, page)
			.then(this.onLoadResults.bind(this, this.lock))
			.catch(this.onLoadFail.bind(this, this.lock));
	},

	loadNextPage: function () {
		if (!this.nextPageLink) {
			return this.loadSearchPage(1);
		}

		this.removeNext();
		this.showLoading();

		this.lock = Date.now();

		StoreUtils.loadBatch(this.nextPageLink)
			.then(this.onLoadResults.bind(this, this.lock))
			.catch(this.onLoadFail.bind(this, this.lock));
	},

	onLoadResults: function (lock, batch) {
		if (lock !== this.lock) { return; }

		var nextLink = batch.Links && Service.getLinkFrom(batch.Links, 'batch-next');

		this.removeLoading();

		if (batch.Items && batch.Items.length) {
			this.Results.addResults(batch.Items);
		} else {
			this.showEmpty();
		}

		if (nextLink) {
			this.nextPageLink = nextLink;
			this.showNext();
		} else {
			delete this.nextPageLink;
			this.removeNext();
		}

		this.OptionMenu.selectType(this.currentSearch.filter);
	},

	onLoadFail: function (lock, reason) {
		if (lock !== this.lock) { return; }

		console.error('Failed to load search results: ', reason);

		this.removeLoading();
		this.showError();
	},

	navigateToSearchHit: function (record, hit, frag, containerId) {
		containerId  = containerId || (hit.get('Containers') || [])[0];
		this.SearchStore.setHitForContainer(containerId, hit, frag);

		this.Router.root.attemptToNavigateToObject(record);
	}
});
