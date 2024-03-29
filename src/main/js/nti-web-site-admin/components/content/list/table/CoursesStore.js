import { Stores, Mixins } from '@nti/lib-store';
import { getService } from '@nti/web-client';
import { mixin } from '@nti/lib-decorators';
import { decorate } from '@nti/lib-commons';

const PAGE_SIZE = 20;
class CoursesStore extends Stores.BoundStore {
	constructor() {
		super();

		this.set({
			items: null,
			loading: true,
		});
	}

	loadPage(pageNumber) {
		this.set('pageNumber', pageNumber);

		this.load();
	}

	applySearchTerm(searchTerm) {
		this.setImmediate('pageNumber', 0);
	}

	async onCourseCreated(catalogEntry) {
		this.load();
	}

	async load() {
		if (this.isBufferingSearch) {
			return;
		}

		this.set('loading', true);

		if (this.searchTerm && this.searchTerm.length < 3) {
			this.set({
				items: [],
				numPages: 1,
				currentSearchTerm: '',
				loading: false,
			});

			return;
		}

		const searchTerm = this.searchTerm;
		const service = await getService();

		try {
			const sortOn = this.sortProperty;
			const sortDirection = this.sortDirection;
			const pageNumber = this.get('pageNumber');

			let params = {};

			if (sortOn) {
				params.sortOn = sortOn;
			}

			if (sortDirection) {
				params.sortOrder = sortDirection;
			}

			if (pageNumber) {
				const batchStart = (pageNumber - 1) * PAGE_SIZE;

				params.batchStart = batchStart;
			} else {
				params.batchStart = 0;
			}

			params.batchSize = PAGE_SIZE;

			if (this.searchTerm) {
				params.filter = this.searchTerm;
			}

			const collection = service.getCollection(
				'AdministeredCourses',
				'Courses'
			);

			const batch = await service.getBatch(collection.href, params);

			if (this.searchTerm !== searchTerm) {
				// TODO: Is there a way to bake this kind of logic into the mixin?
				// a new search term has been entered since we performed the load
				return;
			}

			this.set({
				selectedUsers: [],
				sortOn,
				sortDirection,
				numPages: Math.ceil(batch.Total / PAGE_SIZE),
				pageNumber: batch.BatchPage,
				loading: false,
				items: batch.Items,
				currentSearchTerm: this.searchTerm,
			});
		} catch (e) {
			this.set({
				loading: false,
				error: e.message || 'Could not load courses',
			});
		}
	}
}

export default decorate(CoursesStore, [
	mixin(Mixins.BatchPaging, Mixins.Searchable, Mixins.Sortable),
]);
