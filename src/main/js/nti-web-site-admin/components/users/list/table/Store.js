import {Stores, Mixins} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {mixin} from '@nti/lib-decorators';

const PAGE_SIZE = 20;

export default
@mixin(Mixins.BatchPaging, Mixins.Searchable, Mixins.Sortable, Mixins.Filterable)
class UserListStore extends Stores.BoundStore {

	constructor () {
		super();

		this.set('items', null);
		this.set('loading', true);
		this.set('sortOn', null);
		this.set('sortDirection', null);
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
			this.set('items': []);
			this.set('numPages', 1);
			this.emitChange('items', 'numPages');
			return;
		}

		const service = await getService();

		let items = [];

		try {
			const sortOn = this.sortProperty;
			const sortDirection = this.sortDirection;
			const pageNumber = this.get('pageNumber');

			let params = [];

			if(sortOn) {
				params.push('sortOn=' + sortOn);
			}

			if(sortDirection) {
				params.push('sortOrder=' + sortDirection);
			}

			if(pageNumber) {
				const batchStart = (pageNumber - 1) * PAGE_SIZE;

				params.push('batchStart=' + batchStart);
			}

			params.push('batchSize=' + PAGE_SIZE);
			// TODO: Only get learners, filter out users who are site admins
			params.push('filterAdmins=true');

			if(this.searchTerm) {
				params.push('searchTerm=' + this.searchTerm);
			}

			const paramStr = params.length > 0 ? '?' + params.join('&') : '';

			const siteUsers = await service.getBatch(this.getLink(service) + paramStr);

			items = siteUsers.Items;

			this.set('selectedUsers', []);
			this.set('sortOn', sortOn);
			this.set('sortDirection', sortDirection);
			this.set('numPages', Math.ceil(siteUsers.Total / PAGE_SIZE));
			this.set('pageNumber', siteUsers.BatchPage);

			this.set('loading', false);
			this.set('items', items);

			this.emitChange('loading', 'items', 'sortOn', 'sortDirection', 'numPages', 'pageNumber');
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not load learners');

			this.emitChange('loading', 'error');
		}
	}
}
