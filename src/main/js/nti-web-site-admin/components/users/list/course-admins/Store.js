import { StateStore } from '@nti/web-core/data';
import { getService, getAppUserScopedStorage } from '@nti/web-client';

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

export class CourseAdminsStore extends Base {
	StateKey = 'site-course-admins';

	DefaultSortOn = 'username';
	DefaultSortOrder = 'descending';

	isSameSelectable(a, b) {
		return a.user.getID() === b.user.getID();
	}

	async load(e) {
		const { params } = e;

		const service = await getService();
		const link = service.getWorkspace('Courses').getLink('CourseAdmins');

		if (!link) {
			throw new Error('Access Forbidden');
		}

		const batchParams = { ...params, deactivated: false };
		const batch = await service.getBatch(link, batchParams);

		return { batch, batchParams, link };
	}
}
