import { getAppUserScopedStorage } from '@nti/web-client';
import { StateStore } from '@nti/web-core/data';

const loadMembers = (segment, params) =>
	segment.fetchLink({
		rel: 'members',
		mode: 'batch',
		params,
	});

const loadFilterSetPreview = (segment, filterSet, params) =>
	segment.fetchLink({
		rel: 'members_preview',
		mode: 'batch',
		method: 'put',
		params,
		data: {
			filter_set: filterSet,
		},
	});

export class MembersPreviewStore extends StateStore {
	async load(action) {
		const { segment, filterSet } = action.store.params;

		const preview =
			filterSet !== segment.filterSet
				? await loadFilterSetPreview(segment, filterSet, {
						batchStart: 0,
						batchSize: 10,
				  })
				: await loadMembers(segment, { batchStart: 0, batchSize: 10 });

		return {
			total: preview.total,
			Items: preview.Items,
			href: preview.href,
		};
	}
}

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

export class MembersStore extends Base {
	async load(action) {
		const { segment, filterSet, ...params } = action.store.params;

		const batch =
			filterSet !== segment.filterSet
				? await loadFilterSetPreview(segment, filterSet, params)
				: await loadMembers(segment, params);

		return { batch, href: batch.href };
	}
}
