import {Stores, Mixins} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {URL} from '@nti/lib-commons';
import {mixin} from '@nti/lib-decorators';

import Selectable from './Selectable';

const PAGE_SIZE = 20;
const ACCESS_FORBIDDEN = 'Access forbidden';

export default
@mixin(Selectable, Mixins.Stateful, Mixins.BatchPaging, Mixins.Searchable, Mixins.Sortable, Mixins.Filterable)
class UserListStore extends Stores.BoundStore {

	StatefulProperties = ['sortProperty', 'sortDirection']

	constructor () {
		super();

		this.set('items', null);
		this.set('loading', true);
	}

	async addAdmin (users) {
		const service = await getService();

		try {
			await this.changeRoleForUsers(users.map(u=>u.Username), service, false);
		}
		catch (e) {
			this.set({
				error: e.Message || e,
				loading: false
			});

			return;
		}

		this.load();
	}

	async removeAdmin (users) {
		const service = await getService();

		try {
			await this.changeRoleForUsers(users.map(u=>u.Username), service, true);
		}
		catch (e) {
			this.set({
				error: e.Message || e,
				loading: false
			});

			return;
		}

		this.load();
	}

	changeRoleForUsers (users, service, removing) {
		const siteAdminsLink = service.getWorkspace('SiteAdmin').getLink('SiteAdmins');

		this.set('loading', true);

		if(removing) {
			const params = {
				users: users.join(',')
			};

			URL.appendQueryParams(siteAdminsLink, params);
			return service.delete(URL.appendQueryParams(siteAdminsLink, params));
		}
		else {
			return service.post(siteAdminsLink, { users: users.join(',') });
		}
	}

	loadPage (pageNumber) {
		this.set('pageNumber', pageNumber);

		this.load();
	}

	getLink (service) {
		if(this.filter === 'admin') {
			const adminWorkspace = service.getWorkspace('SiteAdmin');

			if(!adminWorkspace) {
				throw new Error(ACCESS_FORBIDDEN);
			}

			return adminWorkspace.getLink('SiteAdmins');
		}
		else {
			const userWorkspace = service.Items.filter(x => x.hasLink('SiteUsers'))[0];

			if(!userWorkspace) {
				throw new Error(ACCESS_FORBIDDEN);
			}

			return userWorkspace.getLink('SiteUsers');
		}
	}

	async load () {
		this.set('loading', true);

		if(this.searchTerm && this.searchTerm.length < 3) {
			this.set({
				items: [],
				numPages: 1,
				currentSearchTerm: '',
				loading: false
			});

			return;
		}

		const searchTerm = this.searchTerm;

		const service = await getService();

		try {
			const link = this.getLink(service);

			if(!link) {
				throw new Error(ACCESS_FORBIDDEN);
			}

			const sortOn = this.sortProperty;
			const sortDirection = this.sortDirection;
			const pageNumber = this.get('pageNumber');

			let params = {};

			params.sortOn = sortOn || 'createdTime';
			params.sortOrder = sortDirection || 'descending';

			if(pageNumber) {
				const batchStart = (pageNumber - 1) * PAGE_SIZE;

				params.batchStart = batchStart;
			}

			params.batchSize = PAGE_SIZE;

			if(this.filter === 'learners') {
				params.filterAdmins = 'true';
			}

			if(this.searchTerm) {
				params.searchTerm = this.searchTerm;
			}

			const siteUsers = await service.getBatch(link, params);

			if(this.searchTerm !== searchTerm) {
				// a new search term has been entered since we performed the load
				return;
			}

			this.set({
				selectedUsers: [],
				sortOn,
				sortDirection,
				numPages: Math.ceil(siteUsers.Total / PAGE_SIZE),
				pageNumber: siteUsers.BatchPage,
				currentSearchTerm: this.searchTerm,
				loading: false,
				items: siteUsers.Items
			});
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not load learners');
		}
	}
}
