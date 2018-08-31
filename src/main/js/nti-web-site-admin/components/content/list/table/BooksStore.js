import {Stores, Mixins} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {mixin} from '@nti/lib-decorators';

const PAGE_SIZE = 20;

export default
@mixin(Mixins.BatchPaging, Mixins.Searchable, Mixins.Sortable)
class UserListStore extends Stores.BoundStore {

	constructor () {
		super();

		this.set('items', null);
		this.set('loading', true);
		this.set('sortOn', null);
		this.set('sortDirection', null);
	}

	loadPage (pageNumber) {
		this.set('pageNumber', pageNumber);

		this.load();
	}

	async load () {
		this.set('loading', true);
		this.emitChange('loading');

		if(this.searchTerm && this.searchTerm.length < 3) {
			this.set({
				items: [],
				numPages: 1,
				currentSearchTerm: '',
				loading: false
			});

			this.emitChange('items', 'numPages', 'loading');

			return;
		}

		const searchTerm = this.searchTerm;
		const service = await getService();

		let items = [];

		try {
			const sortOn = this.sortProperty;
			const sortDirection = this.sortDirection;
			const pageNumber = this.get('pageNumber');

			let params = {};

			if(sortOn) {
				params.sortOn = sortOn;
			}

			if(sortDirection) {
				params.sortOrder = sortDirection;
			}

			if(pageNumber) {
				const batchStart = (pageNumber - 1) * PAGE_SIZE;

				params.batchStart = batchStart;
			}

			params.batchSize = PAGE_SIZE;

			if(this.searchTerm) {
				params.filter = this.searchTerm;
			}

			const collection = service.getCollection('VisibleContentBundles', 'ContentBundles');

			// batch params not currently supported by server
			const batch = await service.getBatch(collection.href, params);

			const promises = (batch.titles || []).map(x => service.getObject(x));

			const parsed = await Promise.all(promises);

			const result = { items: parsed, total: parsed.length };

			items = result.items;

			if(this.searchTerm !== searchTerm) {
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
				items,
				currentSearchTerm: this.searchTerm
			});

			this.emitChange('loading', 'items', 'sortOn', 'sortDirection', 'numPages', 'pageNumber', 'currentSearchTerm');
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not load learners');

			this.emitChange('loading', 'error');
		}
	}
}
