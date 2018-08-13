import {Stores} from '@nti/lib-store';
import {getService} from '@nti/web-client';

// const PAGE_SIZE = 20;

export default class UserListStore extends Stores.SimpleStore {

	constructor () {
		super();

		this.set('items', null);
		this.set('loading', true);
		this.set('sortOn', null);
		this.set('sortDirection', null);
		this.set('pageNumber', 1);
	}

	setUnload () {
		this.isUnloading = true;

		setTimeout(() => { this.isUnloading = false; }, 100);
	}

	onSortChange (sortOn, sortDirection) {
		this.set('sortOn', sortOn);
		this.set('sortDirection', sortDirection);

		this.loadInvitations();
	}

	goToPage (pageNumber) {
		this.set('pageNumber', pageNumber);

		this.loadInvitations();
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

	async rescind (users) {
		const service = await getService();

		const invitationsCollection = service.getCollection('Invitations', 'Invitations');

		// this should return the list of deleted items, maybe we should compare to users to verify deletion was successful?
		await service.post(invitationsCollection.getLink('delete-site-invitations'), { emails: users.map(x=>x.receiver)});

		this.set('selectedUsers', []);

		this.loadInvitations();
	}

	async sendInvites (emails, message, isAdmin) {
		const service = await getService();

		let payload = {
			invitations: emails.map(x=>{return {'email': x, 'realname': x};}),
			message
		};

		const invitationsCollection = service.getCollection('Invitations', 'Invitations');

		await service.post(invitationsCollection.getLink(isAdmin ? 'send-site-admin-invitation' : 'send-site-invitation'), payload);

		this.loadInvitations();
	}

	sendLearnerInvites (emails, message) {
		this.sendInvites(emails, message);
	}


	sendAdminInvites (emails, message) {
		this.sendInvites(emails, message, true);
	}

	async loadInvitations () {
		if(this.isUnloading) {
			return; // don't re-retrieve and emit changes during unload
		}

		this.set('loading', true);
		this.emitChange('loading');

		const service = await getService();

		const invitationsCollection = service.getCollection('Invitations', 'Invitations');

		const result = await service.getBatch(invitationsCollection.getLink('pending-site-invitations'));
		const adminResult = await service.getBatch(invitationsCollection.getLink('pending-site-admin-invitations'));

		const items = (result.Items || []).concat(adminResult.Items || []);

		this.set('numPages', 0);

		this.set('loading', false);
		this.set('items', items);

		this.emitChange('loading', 'items', 'sortOn', 'sortDirection', 'numPages', 'pageNumber');
	}
}
