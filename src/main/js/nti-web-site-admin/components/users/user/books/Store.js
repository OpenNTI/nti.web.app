import {getService} from '@nti/web-client';
import {Stores} from '@nti/lib-store';
import Logger from '@nti/util-logger';

const logger =  Logger.get('site-admin:components:user:books:store');

export default class UserBookStore extends Stores.SimpleStore {
	constructor () {
		super();

		this.set({
			items: [],
			loading: false,
			error: null
		});
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
		} catch (e) {
			logger.error(e);
			this.set('error', e);
		} finally {
			this.set('loading', false);
		}
	}

	unloadBooks () {
		this.set('items', []);
	}
}
