import {getService} from '@nti/web-client';
import {Stores, Mixins} from '@nti/lib-store';
import {mixin} from '@nti/lib-decorators';

const PAGE_SIZE = 20;

export default
@mixin(Mixins.BatchPaging, Mixins.Searchable)
class BookRosterStore extends Stores.BoundStore {
	constructor () {
		super();

		this.set('searchTerm', null);
		this.set('loading', true);
	}

	get hasBook () {
		return !!this.get('book');
	}

	loadPage (pageNumber) {
		this.set('pageNumber', pageNumber);

		this.load();
	}

	async loadBook (book) {
		if (this.get('book') === book) { return; }

		this.set('book', book);

		this.load();
	}

	async load () {
		this.set('loading', true);
		this.emitChange('loading');

		const service = await getService();
		const pageNumber = this.get('pageNumber');
		const batchStart = pageNumber ? (pageNumber - 1) * PAGE_SIZE : 0;

		let params = {
			batchSize: PAGE_SIZE,
			batchStart
		};

		const searchTerm = this.searchTerm;

		if(this.searchTerm) {
			params.searchTerm = this.searchTerm;
		}

		const result = await service.getBatch(this.get('book').getLink('users'), params);

		if(this.searchTerm !== searchTerm) {
			return;
		}

		this.set({
			items: result.Items,
			loading: false,
			numPages: Math.ceil(result.Total / PAGE_SIZE),
			pageNumber: result.BatchPage
		});

		this.emitChange('items', 'loading');
	}
}
