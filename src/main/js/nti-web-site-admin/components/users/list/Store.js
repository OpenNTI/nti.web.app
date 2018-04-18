import {getService, User} from '@nti/web-client';

import SearchablePagedStore from '../../common/SearchablePagedStore';

const INITIAL_LOAD_CACHE = Symbol('Initial Load Cache');

export default class UserListStore extends SearchablePagedStore {
	async loadSearchTerm (term) {
		if (term.length < 3) {
			return {items: []};
		}

		const service = await getService();
		const link = service.getUserSearchURL(term);

		const batch = await service.getBatch(link);

		delete this[INITIAL_LOAD_CACHE];

		return SearchablePagedStore.convertBatch(batch);
	}

	refresh () {
		delete this[INITIAL_LOAD_CACHE];

		this.load();
	}

	async loadInitial () {
		if (this[INITIAL_LOAD_CACHE]) {
			return this[INITIAL_LOAD_CACHE];
		}

		const service = await getService();
		const community = await User.resolve({entity: service.SiteCommunity});
		const membersLink = community.getLink('members');

		const batch = await service.getBatch(membersLink);
		const result = SearchablePagedStore.convertBatch(batch);

		this[INITIAL_LOAD_CACHE] = result;

		return result;
	}
}
