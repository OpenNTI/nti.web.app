import {getService} from '@nti/web-client';
import {Stores} from '@nti/lib-store';

export default class UserBookStore extends Stores.SimpleStore {
	constructor () {
		super();

		this.set('items', []);
		this.set('loading', false);
		this.set('error', null);
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

	async loadBooks (user) {
		this.set('items', []);
		this.set('loading', true);
		this.emitChange('loading', 'items');

		try {
			const link = user.getLink('UserBundleRecords');

			if (link) {
				const service = await getService();
				const batch = await service.getBatch(link);

				this.set('items', batch.Items);
			} else {
				this.set('items', []);
			}

			this.emitChange('items');
		} catch (e) {
			console.log(e);
			this.set('error', e);
			this.emitChange('error');
		} finally {
			this.set('loading', false);
			this.emitChange('loading');
		}
	}


	unloadBooks () {
		this.set('items', []);
		this.emitChange('items');
	}
}
