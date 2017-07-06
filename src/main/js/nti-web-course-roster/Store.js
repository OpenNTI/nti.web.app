import StorePrototype from 'nti-lib-store';

import {
	LOADING,
	LOADED,
	INSTRUCTORS_LOADED,
	EDITORS_LOADED,
	STUDENTS_LOADED
} from './Constants';

const Protected = Symbol('Protected');

const Loading = Symbol('Loading');
const Loaded = Symbol('Loaded');

const InstructorsLoaded = Symbol('Instructors Loaded');
const EditorsLoaded = Symbol('Editors Loaded');
const StudentsLoaded = Symbol('Students Loaded');

function init (store) {
	store[Protected] = {
		loading: false,
		instructors: null,
		editors: null,
		students: null
	};
}

class Store extends StorePrototype {
	constructor () {
		super();

		init(this);

		this.registerHandlers({
			[LOADING]: Loading,
			[INSTRUCTORS_LOADED]: InstructorsLoaded,
			[EDITORS_LOADED]: EditorsLoaded,
			[STUDENTS_LOADED]: StudentsLoaded
		});
	}


	[Loading] () {
		this[Protected].loading = true;

		this.emitChange({type: LOADING});
	}


	[Loaded] () {
		this[Protected].loading = false;

		this.emitChange({type: LOADED});
	}


	[InstructorsLoaded] (e) {
		const {response} = e.action;

		this[Protected].instructors = response;

		this[Loaded]();
	}


	[EditorsLoaded] (e) {
		const {response} = e.action;

		this[Protected].editors = response;

		this[Loaded]();
	}


	[StudentsLoaded] (e) {
		const {response} = e.action;

		this[Protected].students = response;

		this[Loaded]();
	}


	get loading () {
		return this[Protected].loading;
	}

	get instructors () {
		return this[Protected].instructors;
	}

	get editors () {
		return this[Protected].editors;
	}

	get students () {
		return this[Protected].students;
	}
}

export default new Store();
