Ext.define('NextThought.app.search.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-index',

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.library.Actions',
		'NextThought.app.navigation.Actions',
		'NextThought.app.search.StateStore',
		'NextThought.app.search.components.AdvancedOptions',
		'NextThought.app.search.components.Results'
	],

	layout: 'none',

	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'search-advanced-menu',
				changeFilter: this.changeFilter.bind(this)
			},
			{
				xtype: 'search-results'
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


	getActiveItem: function() {
		return this.Results;
	},


	onActivate: function() {
		this.isActive = true;

		this.mon(this.SearchStore, 'context-updated', this.onContextUpdate);

		if (this.currentSearch) {
			this.doNewSearch();
		}
	},


	onDeactivate: function() {
		this.isActive = false;

		this.mun(this.SearchStore, 'context-updated', this.onContextUpdate);
		this.clearResults();
	},


	updateRoute: function() {
		var search = this.currentSearch,
			term = search.term,
			filter = search.filter,
			page = search.page,
			bundle = search.bundle,
			query = {};

		query.term = encodeURIComponent(term);

		if (filter) {
			query.filter = encodeURIComponent(filter);
		}

		if (page) {
			query.page = ParseUtils.encodeForURI(page);
		}

		if (bundle) {
			query.bundle = ParseUtils.encodeForURI(bundle);
		}

		query = Ext.Object.toQueryString(query);

		//TODO: change this to query params once the server can support it
		this.replaceRoute('Search', '/#' + query);
	},


	showSearch: function(route, subRoute) {
		var params = route.queryParams,
			term = params.term,
			bundle = params.bundle,
			page = params.page,
			filter = params.filter;

		this.NavActions.updateNavBar({
			hideBranding: true,
			noRouteOnSearch: true
		});

		this.setTitle('Search');

		term = term && decodeURIComponent(term);
		bundle = bundle && ParseUtils.decodeFromURI(bundle);
		page = page && ParseUtils.decodeFromURI(page);
		filter = filter && decodeURIComponent(filter);

		if (term) {
			this.SearchActions.syncTerm(term);
		}

		if (!bundle) {
			this.NavActions.setActiveContent(null);
		} else {
			this.LibraryActions.findBundle(bundle)
				.then(this.NavActions.setActiveContent.bind(this.NavActions));
		}

		this.currentSearch = {
			term: term,
			bundle: bundle,
			page: page,
			filter: filter || 'all'
		};

		if (!this.isActive) {
			return this.onActivate();
		}

		this.doNewSearch();

		return Promise.resolve();
	},


	onContextUpdate: function() {
		var term = this.SearchStore.getTerm();

		if (this.currentSearch.term === term) {
			return;
		}

		this.currentSearch.term = term;

		this.updateRoute();
	},


	changeFilter: function(filter) {
		if (this.currentSearch.filter === filter) {
			return;
		}

		this.currentSearch.filter = filter;

		this.updateRoute();
	},



	doNewSearch: function() {
		if (!this.currentSearch) { return; }

		this.clearResults();

		this.loadSearchPage(1);
	},


	clearResults: function() {
		this.Results.removeAll(true);
	},


	getAcceptFilter: function(filter) {
		return this.OptionMenu.getMimeTypes(filter);
	},


	showLoading: function() {
		this.Results.showLoading();
	},


	removeLoading: function() {
		this.Results.removeLoading();
	},


	showError: function() {
		this.Results.showError();
	},


	showNext: function() {
		this.Results.showNext(this.loadNextPage.bind(this));
	},


	removeNext: function() {
		this.Results.removeNext();
	},


	showEmpty: function() {
		this.Results.showEmpty();
	},


	loadSearchPage: function(page) {
		var search = this.currentSearch,
			accepts = this.getAcceptFilter(search.filter);

		this.showLoading();

		this.SearchActions.loadSearchPage(search.term, accepts, search.bundle, search.page, page)
			.then(this.onLoadResults.bind(this))
			.fail(this.onLoadFail.bind(this));
	},


	loadNextPage: function() {
		if (!this.nextPageLink) {
			return this.loadSearchPage(1);
		}

		this.removeNext();
		this.showLoading();

		StoreUtils.loadBatch(this.nextPageLink)
			.then(this.onLoadResults.bind(this))
			.fail(this.onLoadFail.bind(this));
	},


	onLoadResults: function(batch) {
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


	onLoadFail: function(reason) {
		console.error('Failed to load search results: ', reason);

		this.removeLoading();
		this.showError();
	}
});
