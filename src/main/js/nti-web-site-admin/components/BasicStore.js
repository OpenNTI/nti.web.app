import EventEmitter from 'events';

import React from 'react';
import Connector from 'nti-lib-store-connector';

const Instance = Symbol('Instance');

export default class BasicStore extends EventEmitter {
	static getInstance () {
		const Store = this;

		this[Instance] = this[Instance] || new Store();

		return this[Instance];
	}

	static connect (propMap, storeProp = 'store') {
		const store = this.getInstance();
		const extraProps = {
			[storeProp]: store
		};

		return function (component) {
			function StoreConnector (props) {
				return React.createElement(component, {...extraProps, ...props});
			}

			return Connector.connect(
				store,
				StoreConnector,
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
