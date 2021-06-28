import { Stores, Mixins } from '@nti/lib-store';
import { getService } from '@nti/web-client';
import { decorate, URL } from '@nti/lib-commons';
import { mixin } from '@nti/lib-decorators';
import { RedirectTo } from '@nti/web-routing';

import SharedStore from '../SharedStore';

import Selectable from './Selectable';

const PAGE_SIZE = 20;
const ACCESS_FORBIDDEN = 'Access forbidden';

const canDeactivateUsers = service =>
	Boolean(service.Items.find(w => w.hasLink('BatchDeactivate')));
const canActivateUsers = service =>
	Boolean(service.Items.find(w => w.hasLink('BatchReactivate')));

async function bulkActivation(users, rel) {
	const service = await getService();
	const workspace = service.Items.find(x => x.hasLink(rel));

	//utilizing the fact that usermodels are instance tracked
	//so by parsing the response the existing users should get updated

	await workspace.postToLink(
		rel,
		{
			usernames: users.map(u => u.Username),
		},
		true
	);
	SharedStore.markDirty();
}

async function exportObjects(users, link, params) {
	const service = await getService();

	const result = await service.getBatch(link, params);

	RedirectTo(result);
}

class UserListStore extends Stores.BoundStore {
	StatefulProperties = ['sortProperty', 'sortDirection', 'pageNumber'];

	constructor() {
		super();

		this.set({
			items: null,
			loading: true,
		});
	}

	async addAdmin(users) {
		const service = await getService();

		try {
			await this.changeRoleForUsers(
				users.map(u => u.Username),
				service,
				false
			);
		} catch (e) {
			this.set({
				error: e.Message || e,
				loading: false,
			});

			return;
		}

		this.load();
	}

	async removeAdmin(users) {
		const service = await getService();

		try {
			await this.changeRoleForUsers(
				users.map(u => u.Username),
				service,
				true
			);
		} catch (e) {
			this.set({
				error: e.Message || e,
				loading: false,
			});

			return;
		}

		this.load();
	}

	changeRoleForUsers(users, service, removing) {
		const siteAdminsLink = service
			.getWorkspace('SiteAdmin')
			.getLink('SiteAdmins');

		this.set('loading', true);

		if (removing) {
			const params = {
				users: users.join(','),
			};

			URL.appendQueryParams(siteAdminsLink, params);
			return service.delete(
				URL.appendQueryParams(siteAdminsLink, params)
			);
		} else {
			return service.post(siteAdminsLink, { users: users.join(',') });
		}
	}

	async deactivateUsers(users) {
		this.set('loading', true);

		try {
			await bulkActivation(users, 'BatchDeactivate');

			this.load();
		} catch (e) {
			this.set({
				error: e.Message || e,
				loading: false,
			});
		}
	}

	async activateUsers(users) {
		this.set('loading', true);

		try {
			await bulkActivation(users, 'BatchReactivate');

			this.load();
		} catch (e) {
			this.set({
				error: e.Message || e,
				loading: false,
			});
		}
	}

	async exportUsers(users) {
		this.set('loading', true);

		const service = await getService();

		try {
			const link = this.getLink(service);
			await exportObjects(users, `${link}?accepts=csv`, this.get('params'));
		} catch (e) {
			this.set({
				error: e.Message || e,
				loading: false,
			});
		}
	}

	loadPage(pageNumber) {
		this.set('pageNumber', pageNumber);

		this.load();
	}

	getLink(service) {
		if (this.filter === 'admin') {
			const adminWorkspace = service.getWorkspace('SiteAdmin');

			if (!adminWorkspace) {
				throw new Error(ACCESS_FORBIDDEN);
			}

			return adminWorkspace.getLink('SiteAdmins');
		} else {
			const userWorkspace = service.Items.find(x =>
				x.hasLink('SiteUsers')
			);

			if (!userWorkspace) {
				throw new Error(ACCESS_FORBIDDEN);
			}

			return userWorkspace.getLink('SiteUsers');
		}
	}

	applySearchTerm(term) {
		this.setImmediate({
			searchTerm: term,
			pageNumber: 0,
		});
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
			const link = this.getLink(service);

			if (!link) {
				throw new Error(ACCESS_FORBIDDEN);
			}

			const sortOn = this.sortProperty;
			const sortDirection = this.sortDirection;
			const pageNumber = this.get('pageNumber');

			let params = {};

			params.sortOn = sortOn || 'createdTime';
			params.sortOrder = sortDirection || 'descending';

			if (pageNumber) {
				const batchStart = (pageNumber - 1) * PAGE_SIZE;

				params.batchStart = batchStart;
			}

			params.batchSize = PAGE_SIZE;

			if (this.filter === 'learners') {
				params.filterAdmins = 'true';
				params.deactivated = 'false';
			} else if (this.filter === 'admin') {
				params.deactivated = 'false';
			} else if (this.filter === 'deactivated') {
				params.deactivated = 'true';
			}

			if (this.searchTerm) {
				params.searchTerm = this.searchTerm;
			}

			const siteUsers = await service.getBatch(link, params);

			if (this.searchTerm !== searchTerm) {
				// a new search term has been entered since we performed the load
				return;
			}

			this.set({
				canDeactivateUsers: canDeactivateUsers(service),
				canActivateUsers: canActivateUsers(service),
				selectedUsers: [],
				sortOn,
				sortDirection,
				numPages: Math.ceil(siteUsers.Total / PAGE_SIZE),
				pageNumber: siteUsers.BatchPage,
				currentSearchTerm: this.searchTerm,
				loading: false,
				items: siteUsers.Items,
				params: params,
			});
		} catch (e) {
			this.set({
				loading: false,
				error: e.message || 'Could not load learners',
			});
		}
	}
}

export default decorate(UserListStore, [
	mixin(
		Selectable,
		Mixins.Stateful,
		Mixins.BatchPaging,
		Mixins.Searchable,
		Mixins.Sortable,
		Mixins.Filterable
	),
]);
