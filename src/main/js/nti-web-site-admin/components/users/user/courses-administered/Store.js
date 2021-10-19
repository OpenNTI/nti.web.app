import { Stores } from '@nti/lib-store';

export default class UserAdministeredCourseStore extends Stores.SimpleStore {
	constructor() {
		super();

		this.set({ items: [], loading: false, error: null });
	}

	async load(user) {
		this.setImmediate({ items: [], loading: true });

		try {
			const batch = await user.fetchLink({
				rel: 'CoursesExplicitlyAdministered',
				mode: 'batch',
				throwMissing: false,
			});

			this.set('items', batch?.Items ?? []);
		} catch (e) {
			if (e.code !== 'NoUserExplicitlyAdministeredCourses') {
				// we shouldn't show error info for this, just means no enrolled courses and the view will reflect that
				this.set('error', e);
			}
		} finally {
			this.set('loading', false);
		}
	}

	unload() {
		this.set('items', []);
	}
}
