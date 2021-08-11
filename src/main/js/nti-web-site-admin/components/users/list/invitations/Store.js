import { StateStore } from '@nti/web-core/data';
import { getService } from '@nti/web-client';

const Base = StateStore.Behaviors.Searchable(
	StateStore.Behaviors.Filterable(
		StateStore.Behaviors.Sortable(
			StateStore.Behaviors.BatchPaging.Discrete(StateStore)
		)
	)
);

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

	async load({ params }) {
		const service = await getService();
		const invitations = service.getCollection('Invitations', 'Invitations');

		const batch = await service.getBatch(
			invitations.getLink('invitations'),
			fixParams(params)
		);

		return { batch };
	}
}
