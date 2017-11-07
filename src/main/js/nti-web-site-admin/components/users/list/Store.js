import EventEmitter from 'events';

import {getService, User} from 'nti-web-client';

const INITIAL_LOAD_CACHE = Symbol('Initial Load Cache');

function convertBatch (batch) {
	const nextLink = batch.getLink('batch-next');
	const loadNext = !nextLink ?
		null :
		async () => {
			const service = await getService();
			const nextBatch = await service.getBatch(nextLink);

			return convertBatch(nextBatch);
		};

	return {
		items: batch.Items,
		loadNext
	};
}

export default class UserListStore extends EventEmitter {
	constructor () {
		super();

		this._searchTerm = null;
		this._items = [];
		this._loading = false;
		this._loadingNextPage = false;
		this._error = null;

		this._loadNextPage = null;
	}

	get error () {
		return this._error;
	}


	get searchTerm () {
		return this._searchTerm;
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

	get (key) {
		return this[key];
	}

	async load () {
		this._loading = true;
		this.emitChange('loading');

		this._items = [];
		this._loadNextPage = null;

		try {
			const {items, loadNext} = await (this.searchTerm ? this._loadSearchTerm() : this._loadInitial());

			this._items = items;
			this._loadNextPage = loadNext;
			this.emitChange('items', 'loadNextPage');
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
		this.emitChange('loadingNextPage');

		try {
			const {items, loadNext} = await loadNextPage();

			this._items = [...this._items, ...items];
			this._loadNextPage = loadNext;
			this.emitChange('items', 'loadNextPage');
		} catch (e) {
			this._error = e;
			this.emitChange('error');
		} finally {
			this._loadingNextPage = false;
			this.emitChange('loadingNextPage');
		}
	}


	async _loadSearchTerm () {
		const term = this._searchTerm;

		if (term.length < 3) {
			return {items: []};
		}

		const service = await getService();
		const link = service.getUserSearchURL(term);

		const batch = await service.getBatch(link);

		delete this[INITIAL_LOAD_CACHE];

		return convertBatch(batch);
	}


	async _loadInitial () {
		if (this[INITIAL_LOAD_CACHE]) {
			return this[INITIAL_LOAD_CACHE];
		}

		const service = await getService();
		const community = await User.resolve({entity: service.SiteCommunity});
		const membersLink = community.getLink('members');

		const batch = await service.getBatch(membersLink);
		const result = convertBatch(batch);

		this[INITIAL_LOAD_CACHE] = result;

		return result;
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

	emitChange (type) {
		this.emit('change', {type});
	}


	addChangeListener (fn) {
		this.addListener('change', fn);
	}


	removeChangeListener (fn) {
		this.removeListener('change', fn);
	}
}
