import {Stores} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {Models} from '@nti/lib-interfaces';

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
		this.set('loading', true);
		this.emitChange('loading');

		try {
			const service = await getService();

			const invitationsCollection = service.getCollection('Invitations', 'Invitations');

			// this should return the list of deleted items, maybe we should compare to users to verify deletion was successful?
			await service.post(invitationsCollection.getLink('delete-site-invitations'), { emails: users.map(x=>x.receiver)});

			this.set('selectedUsers', []);

			// will set loading back to false after refreshing the data
			this.loadInvitations();
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not rescind invitation');
			this.emitChange('loading', 'error');
		}
	}

	async sendInvites (emails, message, isAdmin) {
		const service = await getService();

		let payload = {
			invitations: emails.map(x=>{return {'receiver': x, 'receiver_name': x};}),
			message,
			MimeType: isAdmin ? Models.invitations.SiteAdminInvitation.MimeType : Models.invitations.SiteInvitation.MimeType
		};

		const invitationsCollection = service.getCollection('Invitations', 'Invitations');

		await service.post(invitationsCollection.getLink('send-site-invitation'), payload);

		this.loadInvitations();
	}

	getSelectedCount () {
		return (this.get('selectedUsers') || []).length;
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

			const service = await getService();

			const invitationsCollection = service.getCollection('Invitations', 'Invitations');

			const result = await service.getBatch(invitationsCollection.getLink('pending-site-invitations') + paramStr);

			this.set('numPages', Math.ceil(result.Total / PAGE_SIZE));
			this.set('pageNumber', result.BatchPage);
			this.set('loading', false);
			this.set('items', result.Items);

			this.emitChange('loading', 'items', 'sortOn', 'sortDirection', 'numPages', 'pageNumber');
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not load invitations');
			this.emitChange('loading', 'error');
		}
	}
}
