import EventEmitter from 'events';

import { StateStore } from '@nti/web-core/data';
import { getService, getAppUserScopedStorage } from '@nti/web-client';
import { Models } from '@nti/lib-interfaces';

const Bus = new EventEmitter();
const InvitesSentEvent = 'invites-sent';

const getStorage = () => {
	let storage = null;

	return {
		getItem(...args) {
			storage = storage || getAppUserScopedStorage();
			return storage.getItem(...args);
		},

		setItem(...args) {
			storage = storage || getAppUserScopedStorage();
			return storage.setItem(...args);
		},
	};
};

const Base = StateStore.Behaviors.Stateful(getStorage())(
	StateStore.Behaviors.Selectable(
		StateStore.Behaviors.Searchable(
			StateStore.Behaviors.Filterable(
				StateStore.Behaviors.Sortable(
					StateStore.Behaviors.BatchPaging.Discrete(StateStore)
				)
			)
		)
	)
);

const INVITATION_TYPES = {
	ADMIN: Models.invitations.SiteAdminInvitation.MimeType,
	LEARNER: Models.invitations.SiteInvitation.MimeType,
};

function fixParams(params) {
	const clone = { ...params };

	if (clone['type_filter'] === 'all') {
		delete clone['type_filter'];
	}

	if (clone.searchTerm) {
		clone.filterOn = 'receiver';
		clone.filter = clone.searchTerm;
		delete clone.searchTerm;
	}

	return clone;
}

export class InvitationsStore extends Base {
	StateKey = 'site-invitations';

	FilterParam = 'type_filter';
	DefaultFilter = 'pending';

	DefaultSortOn = 'created_time';
	DefaultSortOrder = 'descending';

	filterOptions = ['pending', 'all', 'accepted', 'expired'];

	isSameSelectable(a, b) {
		return a.getID() === b.getID();
	}

	onInitialized() {
		const handler = () => this.reload();

		Bus.addListener(InvitesSentEvent, handler);
		return () => Bus.removeListener(InvitesSentEvent, handler);
	}

	onStateUpdate() {
		// 'items' & 'currentPage' are special suspense properties,
		// we have to access these by their "private" names
		const { __items: items, __currentPage: currentPage } = this;

		//if we got back an empty batch and aren't on the first page, try loading the previous
		if (!items?.length && currentPage > 1) {
			this.loadPage(currentPage - 1);
		}
	}

	async load(e) {
		const { params } = e.store;

		const service = await getService();
		const invitations = service.getCollection('Invitations', 'Invitations');
		const batchParams = fixParams(params);

		if (!invitations?.hasLink('invitations')) {
			throw new Error('Access Forbidden');
		}

		const batch = await service.getBatch(
			invitations.getLink('invitations'),
			batchParams
		);

		return { batch, batchParams };
	}
}

export class InvitationCountStore extends StateStore {
	onInitialized() {
		const handler = () => this.reload();

		Bus.addListener(InvitesSentEvent, handler);
		return () => Bus.removeListener(InvitesSentEvent, handler);
	}

	async load() {
		const service = await getService();
		const invitations = service.getCollection('Invitations', 'Invitations');

		const batch = await service.getBatch(
			invitations.getLink('invitations'),
			{ batchSize: 1, batchStart: 0, type_filter: 'pending' }
		);

		return { count: batch.total };
	}
}

export async function canSendInvitations() {
	const service = await getService();

	const invitationsCollection = service.getCollection(
		'Invitations',
		'Invitations'
	);

	return invitationsCollection?.hasLink('send-site-invitation');
}

export const sendLearnerInvites = (emails, message, file) =>
	sendInvites({ emails, message, file });
export const sendAdminInvites = (emails, message, file) =>
	sendInvites({ emails, message, file, isAdmin: true });

export async function sendInvites({ emails, message, file, isAdmin }, silent) {
	const service = await getService();
	const MimeType = isAdmin
		? INVITATION_TYPES.ADMIN
		: INVITATION_TYPES.LEARNER;

	let payload;

	if (file) {
		payload = new FormData();

		if (message) {
			payload.append('message', message);
		}

		payload.append('MimeType', MimeType);
		payload.append('source', file);
	} else {
		payload = {
			invitations: emails.map(receiver => ({ receiver })),
			message,
			MimeType,
		};
	}

	const invitationsCollection = service.getCollection(
		'Invitations',
		'Invitations'
	);

	await service.post(
		invitationsCollection.getLink('send-site-invitation'),
		payload
	);

	Bus.emit(InvitesSentEvent);
}

export async function resend(invitations) {
	const service = await getService();
	const invitationsCollection = service.getCollection(
		'Invitations',
		'Invitations'
	);

	await service.post(invitationsCollection.getLink('send-site-invitation'), {
		invitations: invitations.map(({ receiver }) => ({ receiver })),
	});

	Bus.emit(InvitesSentEvent);
}

export async function rescind(invitations) {
	const service = await getService();

	const invitationsCollection = service.getCollection(
		'Invitations',
		'Invitations'
	);

	await service.post(
		invitationsCollection.getLink('delete-site-invitations'),
		{ codes: invitations.map(x => x.code) }
	);

	Bus.emit(InvitesSentEvent);
}
