import {Stores} from '@nti/lib-store';
import {getService, User} from '@nti/web-client';

const useNewCall = true;
const PAGE_SIZE = 20;

export default class UserListStore extends Stores.SimpleStore {

	constructor () {
		super();

		this.set('items', null);
		this.set('loading', true);
		this.set('sortOn', null);
		this.set('sortDirection', null);
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

	async loadUsers () {
		this.set('loading', true);
		this.emitChange('loading');

		const service = await getService();

		let items = [];

		if(useNewCall) {
			const userWorkspace = service.Items.filter(x => x.hasLink('SiteUsers'))[0];

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

			const siteUsers = await service.getBatch(userWorkspace.getLink('SiteUsers') + paramStr);

			items = siteUsers.Items;

			this.set('numPages', Math.ceil(siteUsers.Total / PAGE_SIZE));
			this.set('pageNumber', siteUsers.BatchPage);
		}
		else {
			const community = await User.resolve({entity: service.SiteCommunity});
			const membersLink = community.getLink('members');

			const siteUsers = await service.getBatch(membersLink);

			items = siteUsers.Items;
		}

		this.set('loading', false);
		this.set('items', items);

		this.emitChange('loading', 'items', 'sortOn', 'sortDirection', 'numPages', 'pageNumber');
	}
}
