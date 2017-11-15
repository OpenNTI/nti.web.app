import {getService} from 'nti-web-client';

import BasicStore from '../../../BasicStore';

export default class UserTranscriptStore extends BasicStore {
	constructor () {
		super();

		this._items = [];
		this._loading = false;
		this._error = null;

		this._loadNextPage = null;
		this._loadingNextPage = null;
	}

	get error () {
		return this._error;
	}

	get items () {
		return this._items;
	}

	get loading () {
		return this._loading;
	}

	get hasNextPage () {
		return !!this._loadNextPage;
	}

	get loadingNextPage () {
		return this._loadingNextPage;
	}

	_addBatch (batch) {
		const nextLink = batch.getLink('batch-next');

		this._items = [...this._items, ...batch.Items];
		this._loadNextPage = !nextLink ?
			null :
			async () => {
				const service = await getService();
				const nextBatch = await service.getBatch(nextLink);

				this._addBatch(nextBatch);
			};

		this.emitChange('items', 'hasNextPage');
	}


	async loadTranscript (user) {
		this._items = [];
		this._loading = true;
		this.emitChange('loading', 'items');

		try {
			const link = user.getLink('UserEnrollments');
			const service = await getService();
			const batch = await service.getBatch(link);

			this._addBatch(batch);
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

		this._loadingNextPage = true;
		this.emitChange('loadingNextPage');

		try {
			await this._loadNextPage();
		} catch (e) {
			this._error = e;
			this.emitChange('error');
		} finally {
			this._loadingNextPage = false;
			this.emitChange('loadingNextPage');
		}
	}


	unloadTranscript () {
		this._items = [];
		this.emitChange('items');
	}
}
