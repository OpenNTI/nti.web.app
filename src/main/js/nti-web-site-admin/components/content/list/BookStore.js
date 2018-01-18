import {getService} from 'nti-web-client';

import SearchablePagedStore from '../../common/SearchablePagedStore';

const INITIAL_LOAD_CACHE = Symbol('Initial Load Cache');

export default class CourseListStore extends SearchablePagedStore {
	async loadSearchTerm (term) {
		const all = await this.loadInitial();

		const filtered = all.items.filter(book => {
			const {title} = book;
			const lowerTerm = term.toLowerCase();

			return (title || '').toLowerCase().indexOf(lowerTerm) >= 0;
		});

		return {...all, total: filtered.length, items: filtered};
	}


	async loadInitial () {
		if (this[INITIAL_LOAD_CACHE]) {
			return this[INITIAL_LOAD_CACHE];
		}

		const service = await getService();
		const collection = service.getCollection('VisibleContentBundles', 'ContentBundles');

		// batch params not currently supported by server
		const batch = await service.get(collection.href);

		const promises = batch.titles.map(x => service.getObject(x));

		const parsed = await Promise.all(promises);

		const result = { items: parsed, total: parsed.length };

		this[INITIAL_LOAD_CACHE] = result;

		return result;
	}
}
