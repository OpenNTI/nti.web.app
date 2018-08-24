import {Stores, Mixins} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {Models} from '@nti/lib-interfaces';
import {mixin} from '@nti/lib-decorators';

const PAGE_SIZE = 20;

export default
@mixin(Mixins.BatchPaging, Mixins.Searchable, Mixins.Sortable)
class UserInvitationsStore extends Stores.BoundStore {
	static Singleton = true;

	constructor () {
		super();

		this.set('items', null);
		this.set('loading', true);
		this.set('pageNumber', 1);
	}

	setUnload () {
		this.isUnloading = true;

		setTimeout(() => { this.isUnloading = false; }, 400);
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
			this.load();
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not rescind invitation');
			this.emitChange('loading', 'error');
		}
	}

	async sendInvites (emails, message, isAdmin) {
		const service = await getService();

		this.set('loading', true);
		this.set('error', null);
		this.emitChange('loading', 'error');

		try {
			let payload = {
				invitations: emails.map(x=>{return {'receiver': x, 'receiver_name': x};}),
				message,
				MimeType: isAdmin ? Models.invitations.SiteAdminInvitation.MimeType : Models.invitations.SiteInvitation.MimeType
			};

			const invitationsCollection = service.getCollection('Invitations', 'Invitations');

			await service.post(invitationsCollection.getLink('send-site-invitation'), payload);

			this.load();
		}
		catch (e) {
			this.set('loading', false);

			if(e.statusCode !== 409) {
				this.set('error', e.Message || e);
			}
			else {
				this.set('error', null);
			}

			this.emitChange('loading', 'error');
		}
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

	loadPage (pageNumber) {
		this.set('pageNumber', pageNumber);

		this.load();
	}

	async load () {
		if(this.isUnloading) {
			return; // don't re-retrieve and emit changes during unload
		}

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

		try {
			const sortOn = this.sortProperty;
			const sortDirection = this.sortDirection;
			const pageNumber = this.get('pageNumber');

			let params = {};

			params.sortOn = sortOn || 'created_time';
			params.sortOrder = sortDirection || 'descending';

			if(pageNumber) {
				const batchStart = (pageNumber - 1) * PAGE_SIZE;

				params.batchStart = batchStart;
			}

			params.batchSize = PAGE_SIZE;

			if(this.searchTerm) {
				params.filterOn = 'receiver';
				params.filter = this.searchTerm;
			}

			const service = await getService();

			const invitationsCollection = service.getCollection('Invitations', 'Invitations');

			if(!invitationsCollection || !invitationsCollection.getLink('pending-site-invitations')) {
				throw new Error('Access forbidden');
			}

			const result = await service.getBatch(invitationsCollection.getLink('pending-site-invitations'), params);

			if(this.searchTerm !== searchTerm) {
				// a new search term has been entered since we performed the load
				return;
			}

			this.set({
				numPages: Math.ceil((result.FilteredTotalItemCount || result.Total) / PAGE_SIZE),
				pageNumber: result.BatchPage,
				sortOn,
				sortDirection,
				loading: false,
				items: result.Items,
				total: result.Total,
				currentSearchTerm: this.searchTerm
			});

			this.emitChange('loading', 'items', 'total', 'sortOn', 'sortDirection', 'numPages', 'pageNumber', 'currentSearchTerm');
		}
		catch (e) {
			this.set('loading', false);
			this.set('error', e.message || 'Could not load invitations');
			this.emitChange('loading', 'error');
		}
	}
}
