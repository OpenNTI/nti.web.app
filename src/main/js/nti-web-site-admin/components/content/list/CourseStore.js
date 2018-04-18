import {getService} from '@nti/web-client';

import SearchablePagedStore from '../../common/SearchablePagedStore';

const DEFAULT_SIZE = 20;
const INITIAL_LOAD_CACHE = Symbol('Initial Load Cache');

export default class CourseListStore extends SearchablePagedStore {
	async loadSearchTerm (term) {
		const service = await getService();
		const collection = service.getCollection('AdministeredCourses', 'Courses');
		const batch = await service.getBatch(collection.href, {batchSize: DEFAULT_SIZE, batchStart: 0, filter: term});

		return SearchablePagedStore.convertBatch(batch, DEFAULT_SIZE);
	}


	async loadInitial () {
		if (this[INITIAL_LOAD_CACHE]) {
			return this[INITIAL_LOAD_CACHE];
		}

		const service = await getService();
		const collection = service.getCollection('AdministeredCourses', 'Courses');

		const batch = await service.getBatch(collection.href, {batchSize: DEFAULT_SIZE, batchStart: 0});
		const result = SearchablePagedStore.convertBatch(batch, DEFAULT_SIZE);

		this[INITIAL_LOAD_CACHE] = result;

		return result;

	}
}
