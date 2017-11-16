import {getService} from 'nti-web-client';

import BasicStore from '../../BasicStore';

const INITIAL_LOAD_CACHE = Symbol('Initial Load Cache');

export default class CourseListStore extends BasicStore {
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

	async load () {
		this._loading = true;
		this.emitChange('loading');

		this._items = [];

		try {
			const items = await this._loadInitial();

			this._items = items;
			this.valueCheck(this._items);
			this.emitChange('items');
		} catch (e) {
			this._error = e;
			this.emitChange('error');
		} finally {
			this._loading = false;
			this.emitChange('loading');
		}
	}

	valueCheck (value) {
		value;
	}

	async _loadInitial () {
		if (this[INITIAL_LOAD_CACHE]) {
			return this[INITIAL_LOAD_CACHE];
		}

		const service = await getService();

		const collection = service.getCollection('AllCourses', 'Courses');
		const batch = await service.get(collection.href);
		const parsed = await service.getObject(batch.Items);

		this[INITIAL_LOAD_CACHE] = parsed;

		return parsed;
	}
}
