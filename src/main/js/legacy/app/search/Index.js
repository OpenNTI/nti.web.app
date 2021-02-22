const Ext = require('@nti/extjs');
const { encodeForURI, decodeFromURI } = require('@nti/lib-ntiids');

const Search = require('nti-web-components-search');
const ChatActions = require('legacy/app/chat/Actions');
const PathActions = require('legacy/app/navigation/path/Actions');
const LibraryActions = require('legacy/app/library/Actions');
const NavigationActions = require('legacy/app/navigation/Actions');
const WindowsActions = require('legacy/app/windows/Actions');
const BaseModel = require('legacy/model/Base');
const lazy = require('legacy/util/lazy-require').get('ParseUtils', () =>
	require('legacy/util/Parsing')
);

const SearchActions = require('./Actions');
const SearchStateStore = require('./StateStore');

require('legacy/mixins/Router');
require('legacy/overrides/ReactHarness');
require('./components/AdvancedOptions');

module.exports = exports = Ext.define('NextThought.app.search.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-index',

	mixins: {
		Route: 'NextThought.mixins.Router',
	},

	layout: 'none',

	initComponent: function () {
		this.callParent(arguments);

		//Init the page caches
		this.clearPages();

		this.ChatActions = ChatActions.create();
		this.PathActions = PathActions.create();
		this.WindowActions = WindowsActions.create();

		this.filtersWidget = this.add({
			xtype: 'search-advanced-menu',
			changeFilter: this.changeFilter.bind(this),
		});

		this.resultsWidget = this.add({
			xtype: 'react',
			component: Search,
			getBreadCrumb: obj => {
				let rec;
				if (typeof obj.toJSON === 'function') {
					rec = lazy.ParseUtils.parseItems(obj.toJSON())[0];
				} else {
					rec = lazy.ParseUtils.parseItems(obj)[0];
				}

				return this.PathActions.getBreadCrumb(rec).then(path => {
					return path;
				});
			},
			onResultsLoaded: () => {
				this.filtersWidget.show();
			},
			navigateToSearchHit: (record, hit, frag, containerId) => {
				let windowOpened = false;

				record = BaseModel.interfaceToModel(record);
				hit = lazy.ParseUtils.parseItems(hit)[0];

				if (
					record.get('MimeType') ===
					'application/vnd.nextthought.messageinfo'
				) {
					this.handleChatNavigation(record, hit);
					return;
				}

				this.SearchStore.setHitForContainer(containerId, hit, frag);

				const failedNavigate = () => {
					this.resultsWidget.setState({ navigating: false });
					this.removeLoading();
					this.filtersWidget.show();

					if (this.WindowActions.hasWindow(record)) {
						if (!windowOpened) {
							windowOpened = true;
							this.WindowActions.pushWindow(record);
						}

						return;
					}

					alert('Could not navigate to search result.');
				};

				this.Router.root.attemptToNavigateToObject(record, {
					onFailedToGetFullPath: failedNavigate,
				});

				this.filtersWidget.hide();
			},
			showNext: () => {
				this.loadNextPage();
			},
			loadPage: page => {
				this.loadSearchPage(page);
			},
			numPages: 1,
		});

		this.LibraryActions = LibraryActions.create();
		this.NavActions = NavigationActions.create();
		this.SearchActions = SearchActions.create();
		this.SearchStore = SearchStateStore.getInstance();

		this.initRouter();

		this.addRoute('/', this.showSearch.bind(this));

		this.addDefaultRoute('/');

		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this),
		});

		this.onContextUpdate = this.onContextUpdate.bind(this);

		this.OptionMenu = this.down('search-advanced-menu');

		this.Results = this.down('react');
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
		var params = route.queryParams,
			term = params.q,
			bundle = params.s,
			page = params.p,
			filter = params.f;

		this.NavActions.updateNavBar({
			hideBranding: true,
			noRouteOnSearch: true,
		});

		this.setTitle('Search');

		term = term && decodeURIComponent(term);
		bundle = bundle && decodeFromURI(bundle);
		page = page && decodeFromURI(page);
		filter = filter && decodeURIComponent(filter);

		if (term) {
			this.SearchActions.syncTerm(term);
		}

		this.NavActions.setActiveContent(null, true, true);

		this.currentSearch = {
			term: term,
			bundle: bundle,
			page: page,
			filter: filter || 'all',
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
		if (!this.currentSearch) {
			return;
		}

		this.clearResults();

		this.Results.setProps({
			numPages: 1,
		});

		this.loadSearchPage(1);
	},

	clearPages() {
		// clear cache on filter/search change since this alters the URL composition
		this.PAGE_TO_HREF = {};
		this.currentPage = 0;
		this.knownPages = 0;
	},

	clearResults: function () {
		this.clearPages();

		this.Results.setProps({
			hits: [],
		});
	},

	getAcceptFilter: function (filter) {
		return this.OptionMenu.getMimeTypes(filter);
	},

	showLoading: function () {
		this.filtersWidget.hide();

		this.Results.setProps({
			showLoading: true,
		});
	},

	removeLoading: function () {
		this.Results.setProps({
			showLoading: false,
		});
	},

	showError: function () {
		const text = 'Error loading search results.';

		this.Results.setProps({
			errorLoadingText: text,
			showMoreButton: false,
		});
	},

	showNext: function () {
		this.Results.setProps({
			showMoreButton: true,
		});
	},

	removeNext: function () {
		this.Results.setProps({
			showMoreButton: false,
		});
	},

	showEmpty: function () {
		const text =
			this.Results.getProps().hits.length > 0
				? 'No more results found.'
				: 'No results found.';

		if (typeof this.Results.getProps().emptyText === 'undefined') {
			this.Results.setProps({
				emptyText: text,
				errorLoadingText: undefined,
			});
		}
	},

	loadSearchPage: function (page) {
		var search = this.currentSearch,
			accepts = this.getAcceptFilter(search.filter);

		this.removeNext();
		this.showLoading();

		this.lock = Date.now();

		const cachedHref = this.PAGE_TO_HREF[page];
		const load = this.SearchActions.loadSearchPage(
			search.term,
			accepts,
			null,
			search.page,
			page,
			cachedHref
		);

		load.then(this.onLoadResults.bind(this, this.lock, page)).catch(
			this.onLoadFail.bind(this, this.lock)
		);
	},

	loadNextPage: function () {
		const nextPage = this.knownPages + 1;

		if (!this.PAGE_TO_HREF[nextPage]) {
			return this.loadSearchPage(1);
		}

		this.loadSearchPage(nextPage);

		// this.removeNext();
		// this.showLoading();

		// this.lock = Date.now();

		// StoreUtils.loadBatch(this.nextPageLink, null, null, null, this.useNewSearch)
		// 	.then(this.onLoadResults.bind(this, this.lock))
		// 	.catch(this.onLoadFail.bind(this, this.lock));
	},

	onLoadResults: function (lock, page, batch) {
		if (lock !== this.lock) {
			return;
		}

		var nextLink =
			batch.Links && Service.getLinkFrom(batch.Links, 'batch-next');

		this.knownPages = Math.max(this.currentPage, page);
		this.currentPage = page;

		//If we've already loaded this page we don't want to
		//override what hrefs we are caching
		if (!this.PAGE_TO_HREF[page]) {
			this.PAGE_TO_HREF[page] = batch.href;
		}

		if (!this.PAGE_TO_HREF[page + 1]) {
			this.PAGE_TO_HREF[page + 1] = nextLink;
		}

		//If we are on the first page and don't have a next link, don't show the pager
		const numPages =
			page === 1 && this.knownPages === 1 && !nextLink
				? 0
				: this.knownPages + 1;

		this.removeLoading();

		const { Items } = batch;

		// empty state:
		// if All filter -> no items or only one item, which is empty user list
		// if People filter -> no items or only one item, which is empty user list
		// if any other filter -> no non-user list items
		const noItemsAtAll = !Items || Items.length === 0;
		const isReallyEmpty =
			noItemsAtAll || (Items[0].Items && Items[0].Items.length === 0);

		let isEmptyState = false;
		if (
			'all' === this.currentSearch.filter ||
			'people' === this.currentSearch.filter
		) {
			isEmptyState = isReallyEmpty;
		} else {
			const nonUserListItems = (Items || []).filter(
				x => x.MimeType !== SearchActions.USER_LIST_MIME_TYPE
			);
			isEmptyState = nonUserListItems.length === 0;
		}

		if (!isEmptyState) {
			// if there are results with the new search, the onResultsLoaded
			// handler will unhide the filters widget when those results
			// have been loaded
			this.Results.setProps({
				hits: batch.Items,
				errorLoadingText: undefined,
				emptyText: undefined,
				currentPage: this.currentPage,
				currentTab: this.currentSearch.filter,
				updateRoute: filter => {
					this.currentSearch.filter = filter;
					this.updateRoute();
				},
				numPages,
			});
		} else if (this.knownPages > 1) {
			// no items but there are known pages, so we don't want to just hide
			// everything (page controls, etc)
			this.filtersWidget.show();

			this.Results.setProps({
				hits: batch.Items,
				errorLoadingText: undefined,
				emptyText: 'End of search results',
				currentPage: this.currentPage,
				currentTab: this.currentSearch.filter,
				updateRoute: filter => {
					this.currentSearch.filter = filter;
					this.updateRoute();
				},
				numPages: numPages,
			});
		} else {
			// need to make sure to unhide the filters widget if there
			// are no results
			this.filtersWidget.show();
			this.showEmpty();
		}
		if (this.PAGE_TO_HREF[this.knownPages + 1]) {
			this.showNext();
		} else {
			this.removeNext();
		}

		this.OptionMenu.selectType(this.currentSearch.filter);
	},

	onLoadFail: function (lock, reason) {
		if (lock !== this.lock) {
			return;
		}

		console.error('Failed to load search results: ', reason);

		this.removeLoading();
		this.showError();
	},

	navigateToSearchHit: function (record, hit, frag, containerId) {
		containerId = containerId || (hit.get('Containers') || [])[0];
		record = lazy.ParseUtils.parseItems(record)[0];
		hit = lazy.ParseUtils.parseItems(hit)[0];
		this.SearchStore.setHitForContainer(containerId, hit, frag);

		this.Router.root.attemptToNavigateToObject(record);
	},

	handleChatNavigation(record, hit) {
		const hitId = encodeForURI(hit.get('NTIID'));

		this.el.mask('Loading...');

		this.ChatActions.loadTranscript(record.get('ContainerId'))
			.then(transcript => {
				this.el.unmask();

				this.WindowActions.pushWindow(transcript, hitId);
			})
			.catch(() => {
				this.el.unmask();
			});
	},
});
