import StorePrototype from 'nti-lib-store';

import {
	INSTRUCTORS_LOADED,
	EDITORS_LOADED,
	LOADED,
	RESET_STORE
} from './Constants';

const Protected = Symbol('Protected');

const InstructorsLoaded = Symbol('Instructors Loaded');
const EditorsLoaded = Symbol('Editors Loaded');
const ResetStore = Symbol('Reset Store');

function init (store) {
	store[Protected] = {
		instructors: null,
		editors: null,
		permissions: null
	};
}

class Store extends StorePrototype {
	constructor () {
		super();

		init(this);

		this.registerHandlers({
			[INSTRUCTORS_LOADED]: InstructorsLoaded,
			[EDITORS_LOADED]: EditorsLoaded,
			[RESET_STORE]: ResetStore
		});
	}

	[ResetStore] () {
		init(this);
	}


	[InstructorsLoaded] (e) {
		const {response} = e.action;

		this[Protected].instructors = response;

		this.emitChange({type: INSTRUCTORS_LOADED});

		if (this.editors) {
			this.emitChange({type: LOADED});
		}
	}


	[EditorsLoaded] (e) {
		const {response} = e.action;

		this[Protected].editors = response;

		this.emitChange({type: EDITORS_LOADED});

		if (this.instructors) {
			this.emitChange({type: LOADED});
		}
	}


	get instructors () {
		return this[Protected].instructors;
	}


	get editors () {
		return this[Protected].editors;
	}
}

export default new Store();
