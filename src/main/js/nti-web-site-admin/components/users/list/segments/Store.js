import { getService, getAppUserScopedStorage } from '@nti/web-client';
import { StateStore } from '@nti/web-core/data';

const getSegmentsCollection = async () => {
	const service = await getService();

	return service.getCollection('Segments', 'SiteAdmin');
};

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

const SegmentTemplate = () => ({
	MimeType: 'application/vnd.nextthought.segments.usersegment',
	title: 'Untitled Segment',
});

export class UserSegmentsStore extends Base {
	StateKey = 'user-segments';

	async load(action) {
		const { params } = action;

		const collection = await getSegmentsCollection();
		const batch = await collection.fetchLink({
			rel: 'self',
			mode: 'batch',
			params,
		});

		return {
			collection,
			batch,
			canCreateSegment: true,
		};
	}

	createSegment = Base.Action(async action => {
		const { collection } = action.store.state;
		const newSegment = await collection.postToLink(
			'self',
			SegmentTemplate(),
			true
		);

		return newSegment;
	});
}

export async function hasUserSegments() {
	return Boolean(await getSegmentsCollection());
}
