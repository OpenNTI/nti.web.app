import {User} from 'nti-web-client';

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
		return this._error;
	}


	async loadUser (user) {
		if (this.user && user === this.user.getID()) { return; }

		this._user = null;
		this._loading = true;
		this.emitChange('loading');

		try {
			const resolved = await User.resolve({entity: user});

			this._user = resolved;
			this.emitChange('user');
		} catch (e) {
			this._error = e;
			this.emitChange('error');
		} finally {
			this._loading = false;
			this.emitChange('loading');
		}
	}


	unloadUser (user) {
		if (user !== this.user.getID()) { return; }

		this._user = null;
		this.onChange('user');
	}
}
