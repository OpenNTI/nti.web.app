import { User } from '@nti/web-client';
import { Stores } from '@nti/lib-store';

export default class UserStore extends Stores.SimpleStore {
	constructor() {
		super();

		this.set('loading', false);
		this.set('user', null);
		this.set('error', null);
	}

	get user() {
		return this.get('user');
	}

	async loadUser(user) {
		if (user === this.user?.getID?.()) {
			return;
		}

		this.set('user', null);
		this.set('loading', true);
		this.emitChange('loading');

		try {
			const resolved = await User.resolve({ entity: user });
			const bookRecords = await resolved.fetchLink({
				throwMissing: false,
				mode: 'raw',
				rel: 'UserBundleRecords',
			});

			const hasBooks = bookRecords?.Items?.length > 0;
			let hasCourses = true; // inexpensive way to know this?  for now, always true

			this.set('user', resolved);
			this.set('hasBooks', hasBooks);
			this.set('hasCourses', hasCourses);
			this.emitChange('user', 'hasBooks', 'hasCourses');
		} catch (e) {
			this.set('error', e);
			this.emitChange('error');
		} finally {
			this.set('loading', false);
			this.emitChange('loading');
		}
	}

	unloadUser(user) {
		if (this.user && user !== this.user.getID()) {
			return;
		}

		this.set('user', null);
		this.emitChange('user');
	}
}
