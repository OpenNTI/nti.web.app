import {Stores} from '@nti/lib-store';
import {getService, User} from '@nti/web-client';

const PAGE_SIZE = 20;

export default class UserListStore extends Stores.SimpleStore {

	constructor () {
		super();

		this.set('items', null);
		this.set('loading', true);
		this.set('sortOn', null);
		this.set('sortDirection', null);
		this.set('pageNumber', 1);
	}

	onSortChange (sortOn, sortDirection) {
		this.set('sortOn', sortOn);
		this.set('sortDirection', sortDirection);

		this.loadUsers();
	}

	goToPage (pageNumber) {
		this.set('pageNumber', pageNumber);

		this.loadUsers();
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

		this.loadUsers();
	}

	async removeAdmin (users) {
		const service = await getService();
		const results = await Promise.all(users.map(user => this.changeRoleForUser(user, service, true)));
		const errors = results.filter(x => x && x.error);

		if(errors.length > 0) {
			this.set('error', 'Unknown error removing admin role for ' + errors.length + ' user(s)');
		}

		this.loadUsers();
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

	async loadUsers () {
		this.set('loading', true);
		this.emitChange('loading');

		const service = await getService();

		let items = [];

		try {
			const sortOn = this.get('sortOn');
			const sortDirection = this.get('sortDirection');
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

			const paramStr = params.length > 0 ? '?' + params.join('&') : '';

			const siteAdminsLink = service.getWorkspace('SiteAdmin').getLink('SiteAdmins');
			const siteAdmins = await service.getBatch(siteAdminsLink + paramStr);

			items = siteAdmins.Items;

			this.set('numPages', Math.ceil(siteAdmins.Total / PAGE_SIZE));

			this.set('loading', false);
			this.set('items', items);

			this.emitChange('loading', 'items', 'sortOn', 'sortDirection', 'numPages', 'pageNumber');
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not load site administrators');
			this.emitChange('loading', 'error');
		}
	}
}