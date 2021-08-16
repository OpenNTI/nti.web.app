import EventEmitter from 'events';

import { StateStore } from '@nti/web-core/data';
import { getService } from '@nti/web-client';
import { Models } from '@nti/lib-interfaces';

const Bus = new EventEmitter();
const InvitesSentEvent = 'invites-sent';

const Base = StateStore.Behaviors.Selectable(
	StateStore.Behaviors.Searchable(
		StateStore.Behaviors.Filterable(
			StateStore.Behaviors.Sortable(
				StateStore.Behaviors.BatchPaging.Discrete(StateStore)
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

	return clone;
}

export class InvitationsStore extends Base {
	static FilterParam = 'type_filter';
	static DefaultFilter = 'all';

	static DefaultSortProperty = 'created_time';
	static DefaultSortDirection = 'descending';

	filterOptions = ['all', 'pending', 'accepted', 'expired'];

	onInitialized() {
		const handler = () => this.reload();

		Bus.addListener(InvitesSentEvent, handler);
		return () => Bus.removeListener(InvitesSentEvent, handler);
	}

	async load(e) {
		const { params } = e;

		const service = await getService();
		const invitations = service.getCollection('Invitations', 'Invitations');
		const batchParams = fixParams(params);

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
			{ batchSize: 1, batchStart: 0 }
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
	const isAdmin = invite => invite?.MimeType === INVITATION_TYPES.ADMIN;
	const arr = Array.isArray(invitations) ? invitations : [invitations];

	const groupBy = getKey => (acc, item) => {
		const key = getKey(item);
		return {
			...acc,
			[key]: [...(acc[key] || []), item],
		};
	};

	// group invitations with the same mime type and message
	const keyFactory = ({ MimeType, message }) => `${MimeType}${message}`;
	const grouped = arr.reduce(groupBy(keyFactory), {});

	// options for this.sendInvites for each mime/message group
	const batches = Object.values(grouped).map(invites => ({
		emails: invites.map(({ receiver }) => receiver),
		message: invites[0].message,
		isAdmin: isAdmin(invites[0]),
	}));

	batches.forEach(batch => sendInvites(batch, true));
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
}
