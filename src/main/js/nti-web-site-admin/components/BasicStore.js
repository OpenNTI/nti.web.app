import EventEmitter from 'events';

import Connector from 'nti-lib-store-connector';

const Instance = Symbol('Instance');

export default class UserStore extends EventEmitter {
	static getInstance () {
		this[Instance] = this[Instance] || new UserStore();

		return this[Instance];
	}

	static connect (propMap) {
		const store = this.getInstance();

		return function (component) {
			return Connector.connect(
				store,
				component,
				propMap
			);
		};
	}

	get (key) {
		return this[key];
	}

	emitChange (type) {
		this.emit('change', {type});
	}


	addChangeListener (fn) {
		this.addListener('change', fn);
	}


	removeChangeListener (fn) {
		this.removeListener('change', fn);
	}
}
