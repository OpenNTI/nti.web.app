import {getService, User} from 'nti-web-client';

import BasicStore from '../../BasicStore';

export default class UserStore extends BasicStore {
	constructor () {
		super();

		this._loading = false;
		this._user = null;
		this._error = null;
	}


	get loading () {
		return this._loading;
	}


	get user () {
		return this._user;
	}


	get error () {
		return this._error
	}


	async loadUser (user) {
		if (user === this.user.getID()) { return; }

		this._user = null;
		this._loading = true;
		this.onChange('loading');

		try {
			const resolved = await User.resolve(user);

			this._user = resolved;
			this.onChange('user');
		} catch (e) {
			this._error = e;
			this.onChange('error');
		} finally {
			this._loading = false;
			this.onChange('loading');
		}
	}
}
