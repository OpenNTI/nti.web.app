import {getService} from 'nti-web-client';

import SearchablePagedStore from '../../common/SearchablePagedStore';

const INITIAL_LOAD_CACHE = Symbol('Initial Load Cache');

export default class UserListStore extends SearchablePagedStore {
	async loadSearchTerm (term) {
		if (term.length < 3) {
			return {items: []};
		}

		return this.loadInitial(); // is search supported for SiteAdmins?
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
