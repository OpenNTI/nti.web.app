import {User} from '@nti/web-client';
import {Stores} from '@nti/lib-store';

export default class UserStore extends Stores.SimpleStore {
	constructor () {
		super();

		this.set('loading', false);
		this.set('user', null);
		this.set('error', null);
	}


	get user () {
		return this.get('user');
	}



	async loadUser (user) {
		if (this.user && user === this.user.getID()) { return; }

		this.set('user', null);
		this.set('loading', true);
		this.emitChange('loading');

		try {
			const resolved = await User.resolve({entity: user});

			let hasBooks = false;
			let hasCourses = true; // inexpensive way to know this?  for now, always true

			if(resolved.hasLink('UserBundleRecords')) {
				const bookRecords = await resolved.fetchLink('UserBundleRecords');

				if(bookRecords && bookRecords.Items && bookRecords.Items.length > 0) {
					hasBooks = true;
				}
			}

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


	unloadUser (user) {
		if (user !== this.user.getID()) { return; }

		this.set('user', null);
		this.onChange('user');
	}
}
