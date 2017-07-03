import StorePrototype from 'nti-lib-store';

import {INSTRUCTORS_LOADED, EDITORS_LOADED} from './Constants';

const Protected = Symbol('Protected');

const InstructorsLoaded = Symbol('Instructors Loaded');
const EditorsLoaded = Symbol('Editors Loaded');

function init (store) {
	store[Protected] = {
		instructors: null,
		editors: null
	};
}

class Store extends StorePrototype {
	constructor () {
		super();

		init(this);

		this.registerHandlers({
			[INSTRUCTORS_LOADED]: InstructorsLoaded,
			[EDITORS_LOADED]: EditorsLoaded
		});
	}


	[InstructorsLoaded] (e) {
		const {response} = e.action;

		this[Protected].instructors = response;

		this.emitChange({type: INSTRUCTORS_LOADED});
	}


	[EditorsLoaded] (e) {
		const {response} = e.action;

		this[Protected].editors = response;

		this.emitChange({type: EDITORS_LOADED});
	}


	get instructors () {
		return this[Protected].instructors;
	}


	get editors () {
		return this[Protected].editors;
	}
}

export default new Store();
