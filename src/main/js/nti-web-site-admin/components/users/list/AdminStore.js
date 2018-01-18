import {getService} from 'nti-web-client';

import SearchablePagedStore from '../../common/SearchablePagedStore';

const INITIAL_LOAD_CACHE = Symbol('Initial Load Cache');

export default class UserListStore extends SearchablePagedStore {
	async loadSearchTerm (term) {
		if (term.length < 3) {
			return {items: []};
		}

		// search is not currently supported for SiteAdmins link, so we'll do some simple client-side filtering
		const all = await this.loadInitial();

		const filtered = all.items.filter(user => {
			const {alias, realName, Username} = user;
			const lowerTerm = term.toLowerCase();

			return (alias || '').toLowerCase().indexOf(lowerTerm) >= 0
				|| (realName || '').toLowerCase().indexOf(lowerTerm) >= 0
				|| (Username || '').toLowerCase().indexOf(lowerTerm) >= 0;
		});

		return {...all, total: filtered.length, items: filtered};
	}

	async loadInitial () {
		if (this[INITIAL_LOAD_CACHE]) {
			return this[INITIAL_LOAD_CACHE];
		}

		const service = await getService();
		const siteAdminsLink = service.getWorkspace('SiteAdmin').getLink('SiteAdmins');
		const siteAdmins = await service.getBatch(siteAdminsLink);
		const result = SearchablePagedStore.convertBatch(siteAdmins);

		this[INITIAL_LOAD_CACHE] = result;

		return result;
	}

	async addAdmin (userName) {
		const service = await getService();
		const siteAdminsLink = service.getWorkspace('SiteAdmin').getLink('SiteAdmins');
		await service.post(siteAdminsLink + '/' + userName);

		this[INITIAL_LOAD_CACHE] = null;
		this.load();
	}

	async removeAdmin (userName) {
		const service = await getService();
		const siteAdminsLink = service.getWorkspace('SiteAdmin').getLink('SiteAdmins');
		await service.delete(siteAdminsLink + '/' + userName);

		this[INITIAL_LOAD_CACHE] = null;
		this.load();
	}
}
