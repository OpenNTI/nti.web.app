import {getService} from 'nti-web-client';

import BasicStore from '../BasicStore';

export default class SearchablePagedStore extends BasicStore {
	static convertBatch (batch) {
		const nextLink = batch.getLink('batch-next');
		const loadNext = !nextLink ?
			null :
			async () => {
				const service = await getService();
				const nextBatch = await service.getBatch(nextLink);

				return SearchablePagedStore.convertBatch(nextBatch);
			};

		return {
			items: batch.Items,
			loadNext,
			total: batch.Total
		};
	}

	constructor () {
		super();

		this._searchTerm = null;

		this._items = [];
		this._loading = false;
		this._error = null;

		this._loadingNextPage = false;
		this._loadNextPage = null;
	}


	get error () {
		return this._error;
	}

	get searchTerm () {
		return this._searchTerm;
	}

	get total () {
		return this._total;
	}

	get items () {
		return this._items;
	}

	get loading () {
		return this._loading;
	}

	get loadingNextPage () {
		return this._loadingNextPage;
	}

	get hasNextPage () {
		return !!this._loadNextPage;
	}

	async load () {
		this._loading = true;
		this.emitChange('loading');

		this._items = [];
		this._loadNextPage = null;

		try {
			const {items, total, loadNext} = await (this.searchTerm ? this.loadSearchTerm(this.searchTerm) : this.loadInitial());

			this._items = items;
			this._loadNextPage = loadNext;
			this._total = total;
			this.emitChange('items', 'loadNextPage', 'total');
		} catch (e) {
			this._error = e;
			this.emitChange('error');
		} finally {
			this._loading = false;
			this.emitChange('loading');
		}
	}


	async loadNextPage () {
		if (!this._loadNextPage) { return; }

		const loadNextPage = this._loadNextPage;

		this._loadingNextPage = true;
		this._loadNextPage = null;
		this.emitChange('loadingNextPage', 'hasNextPage');

		try {
			const {items, loadNext} = await loadNextPage();

			this._items = [...this._items, ...items];
			this._loadNextPage = loadNext;
			this.emitChange('items', 'hasNextPage');
		} catch (e) {
			this._error = e;
			this.emitChange('error');
		} finally {
			this._loadingNextPage = false;
			this.emitChange('loadingNextPage');
		}
	}


	updateSearchTerm (term) {
		this._loading = true;
		this._searchTerm = term;
		this.emitChange('loading', 'searchTerm');

		clearTimeout(this.doSearchTimeout);

		if (!term) {
			this.load();
		} else {
			this.doSearchTimeout = setTimeout(() => {
				this.load();
			}, 300);
		}
	}

	/**
	 * Return the items and loadNext function for a given search term
	 * @override
	 * @param  {String} term term to search on
	 * @return {Object}      with the items and loadNext function
	 */
	loadSearchTerm (term) {}

	/**
	 * Return the items and loadNext function for a given search term
	 * @override
	 * @return {Object}      with the items and loadNext function
	 */
	loadInitial () {}
}
