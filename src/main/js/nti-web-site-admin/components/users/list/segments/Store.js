import { getService, getAppUserScopedStorage } from '@nti/web-client';
import { StateStore } from '@nti/web-core/data';

const {
	BatchPaging: { Discrete },
	Stateful,
	Selectable,
	Searchable,
	Filterable,
	Sortable,
} = StateStore.Behaviors;

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

const SegmentTemplate = () => ({
	MimeType: 'application/vnd.nextthought.segments.usersegment',
	title: 'Untitled Segment',
});

const Base = Stateful(getStorage())(
	Selectable(Searchable(Filterable(Sortable(Discrete(StateStore)))))
);

export class UserSegmentsStore extends Base {
	StateKey = 'user-segments';

	async load(action) {
		const { params } = action.store;

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
