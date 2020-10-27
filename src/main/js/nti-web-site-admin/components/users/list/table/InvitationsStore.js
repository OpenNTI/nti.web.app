import {Stores, Mixins} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {Models} from '@nti/lib-interfaces';
import {mixin} from '@nti/lib-decorators';

import Selectable from './Selectable';

const PAGE_SIZE = 20;

const INVITATION_TYPES = {
	ADMIN: Models.invitations.SiteAdminInvitation.MimeType,
	LEARNER: Models.invitations.SiteInvitation.MimeType
};

export default
@mixin(Selectable, Mixins.BatchPaging, Mixins.Searchable, Mixins.Sortable)
class UserInvitationsStore extends Stores.BoundStore {
	static Singleton = true;

	constructor () {
		super();

		this.set({
			items: null,
			loading: true,
			pageNumber: 1,
			showInviteDialog: false
		});
	}

	setUnload () {
		this.isUnloading = true;

		setTimeout(() => { this.isUnloading = false; }, 400);
	}

	clearInviteError () {
		this.set('inviteError', null);
	}

	async canSendInvitations () {
		const service = await getService();

		const invitationsCollection = service.getCollection('Invitations', 'Invitations');

		return invitationsCollection && invitationsCollection.hasLink('send-site-invitation');
	}

	async rescind (users) {
		this.set('loading', true);

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
		}
	}

	async resend (invitations) {
		const isAdmin = invite => invite?.MimeType === INVITATION_TYPES.ADMIN;
		const arr = Array.isArray(invitations) ? invitations : [invitations];

		const groupBy = (getKey) => (acc, item) => {
			const key = getKey(item);
			return {
				...acc,
				[key]: [...(acc[key] || []), item]
			};
		};

		// group invitations with the same mime type and message
		const keyFactory = ({MimeType, message}) => `${MimeType}${message}`;
		const grouped = arr.reduce(groupBy(keyFactory), {});

		// options for this.sendInvites for each mime/message group
		const batches = Object.values(grouped).map( invites => ({
			emails: invites.map(({receiver}) => receiver),
			message: invites[0].message,
			isAdmin: isAdmin(invites[0])
		}));

		batches.forEach(batch => this.sendInvites(batch));

	}

	async sendInvites ({ emails, message, file, isAdmin }) {
		const service = await getService();

		this.set('loading', true);
		this.set('inviteError', null);
		const MimeType = isAdmin
			? INVITATION_TYPES.ADMIN
			: INVITATION_TYPES.LEARNER;

		try {
			let payload;

			if (file) {
				payload = new FormData();

				if(message) {
					payload.append('message', message);
				}

				payload.append('MimeType', MimeType);
				payload.append('source', file);
			} else {
				payload = {
					invitations: emails.map(receiver => ({ receiver })),
					message,
					MimeType
				};
			}

			const invitationsCollection = service.getCollection('Invitations', 'Invitations');

			await service.post(invitationsCollection.getLink('send-site-invitation'), payload);

			this.load();

			this.hideInviteDialog();
		}
		catch (e) {
			this.set('loading', false);

			if (e.statusCode !== 409) {
				this.set('inviteError', e || {message: 'Could not send invitations.'});
			} else {
				this.set('inviteError', null);
			}
		}
	}

	getSelectedCount () {
		return (this.get('selectedUsers') || []).length;
	}

	sendLearnerInvites (emails, message, file) {
		this.sendInvites({ emails, message, file });
	}


	sendAdminInvites (emails, message, file) {
		this.sendInvites({ emails, message, file, isAdmin: true });
	}

	loadPage (pageNumber) {
		this.set('pageNumber', pageNumber);

		this.load();
	}

	showInviteDialog = () => {
		this.set('showInviteDialog', true);
	}

	hideInviteDialog = () => {
		this.set({'showInviteDialog': false, 'inviteError': null});
	}

	async load () {
		if(this.isUnloading) {
			return; // don't re-retrieve and emit changes during unload
		}

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
				params.batchStart = 0;
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

		}
		catch (e) {
			this.set({
				loading: false,
				error: e.message || 'Could not load invitations'
			});
		}
	}
}
