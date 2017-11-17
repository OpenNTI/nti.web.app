import {getService} from 'nti-web-client';

import BasicStore from '../../../BasicStore';

export default class UserTranscriptStore extends BasicStore {
	constructor () {
		super();

		this._items = [];
		this._loading = false;
		this._error = null;
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

	async loadTranscript (user) {
		this._items = [];
		this._loading = true;
		this.emitChange('loading', 'items');

		try {
			const link = user.getLink('UserEnrollments');

			if(link) {
				const service = await getService();
				const batch = await service.getBatch(link);

				this._items = batch.Items;
			}
			else {
				this._items = [];
			}

			this.emitChange('items');
		} catch (e) {
			this._error = e;
			this.emitChange('error');
		} finally {
			this._loading = false;
			this.emitChange('loading');
		}
	}


	unloadTranscript () {
		this._items = [];
		this.emitChange('items');
	}
}
