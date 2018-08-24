import {Stores, Mixins} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {mixin} from '@nti/lib-decorators';

const PAGE_SIZE = 20;

export default
@mixin(Mixins.Stateful, Mixins.BatchPaging, Mixins.Searchable, Mixins.Sortable, Mixins.Filterable)
class UserListStore extends Stores.BoundStore {

	StatefulProperties = ['sortProperty', 'sortDirection']

	constructor () {
		super();

		this.set('items', null);
		this.set('loading', true);
	}

	selectAll () {
		this.set('selectedUsers', this.get('items'));

		this.emitChange('selectedUsers');
	}

	deselectAll () {
		this.set('selectedUsers', []);

		this.emitChange('selectedUsers');
	}

	isAllSelected () {
		const selected = this.get('selectedUsers');
		const items = this.get('items');

		return selected && selected.length === items.length;
	}

	onSelect (user) {
		let selected = this.get('selectedUsers');

		if(!selected) {
			selected = [user];
		}
		else {
			selected.push(user);
		}

		this.set('selectedUsers', selected);

		this.emitChange('selectedUsers');
	}

	isSelected (user) {
		return (this.get('selectedUsers') || []).some(x => x.getID() === user.getID());
	}

	onDeselect (user) {
		let selected = this.get('selectedUsers');

		selected = selected.filter(x => x.getID() !== user.getID());

		this.set('selectedUsers', selected);

		this.emitChange('selectedUsers');
	}

	async addAdmin (users) {
		const service = await getService();
		const results = await Promise.all(users.map(user => this.changeRoleForUser(user, service)));
		const errors = results.filter(x => x && x.error);

		if(errors.length > 0) {
			this.set('error', 'Unknown error setting admin role for ' + errors.length + ' user(s)');
		}

		this.load();
	}

	async removeAdmin (users) {
		const service = await getService();
		const results = await Promise.all(users.map(user => this.changeRoleForUser(user, service, true)));
		const errors = results.filter(x => x && x.error);

		if(errors.length > 0) {
			this.set('error', 'Unknown error removing admin role for ' + errors.length + ' user(s)');
		}

		this.load();
	}

	changeRoleForUser (user, service, removing) {
		const userName = user.Username;
		const siteAdminsLink = service.getWorkspace('SiteAdmin').getLink('SiteAdmins');

		this.set('loading', true);
		this.emitChange('loading');

		if(removing) {
			return service.delete(siteAdminsLink + '/' + userName).catch(() => {
				return Promise.resolve({error: 'Could not change roles for ' + userName});
			});
		}
		else {
			return service.post(siteAdminsLink + '/' + userName).catch(() => {
				return Promise.resolve({error: 'Could not change roles for ' + userName});
			});
		}
	}

	loadPage (pageNumber) {
		this.set('pageNumber', pageNumber);

		this.load();
	}

	getLink (service) {
		if(this.filter === 'admin') {
			return service.getWorkspace('SiteAdmin').getLink('SiteAdmins');
		}
		else {
			return service.Items.filter(x => x.hasLink('SiteUsers'))[0].getLink('SiteUsers');
		}
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

		try {
			const link = this.getLink(service);

			if(!link) {
				throw new Error('Access forbidden');
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

			this.emitChange('loading', 'items', 'sortOn', 'sortDirection', 'numPages', 'pageNumber', 'currentSearchTerm');
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not load learners');

			this.emitChange('loading', 'error');
		}
	}
}
