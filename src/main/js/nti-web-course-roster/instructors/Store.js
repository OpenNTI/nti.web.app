import StorePrototype from 'nti-lib-store';

import Permissions from './Permissions';
import {
	LOADING,
	ERROR,
	SEARCHING,
	INSTRUCTORS_LOADED,
	INSTRUCTOR_ADDED,
	INSTRUCTOR_REMOVED,
	EDITORS_LOADED,
	EDITOR_ADDED,
	EDITOR_REMOVED,
	USERS_LOADED,
	LIST_UPDATED
} from './Constants';

const Protected = Symbol('Protected');

const Loading = Symbol('Loading');
const Searching = Symbol('Searching');
const SetError = Symbol('Set Error');
const InstructorsLoaded = Symbol('Instructors Loaded');
const UpdateInstructors = Symbol('Update Instructors');
const AddInstructor = Symbol('Add Instructor');
const RemoveInstructor = Symbol('Remove Instructor');
const EditorsLoaded = Symbol('Editors Loaded');
const UpdateEditors = Symbol('Update Editors');
const AddEditor = Symbol('Add Editor');
const RemoveEditor = Symbol('Remove Editor');
const UsersLoaded = Symbol('Users Loaded');

const GetManagers = Symbol('Get Manager');
const SetList = Symbol('Set List');

function getUserMap (users) {
	return users.reduce((acc, user) => {
		acc[user.getID()] = true;

		return acc;
	}, {});
}

function init (store) {
	store[Protected] = {
		loading: false,
		searching: false,
		instructors: [],
		editors: [],
		permissionsList: []
	};
}


class Store extends StorePrototype {
	constructor () {
		super();

		init(this);

		this.registerHandlers({
			[LOADING]: Loading,
			[SEARCHING]: Searching,
			[ERROR]: SetError,
			[INSTRUCTORS_LOADED]: InstructorsLoaded,
			[INSTRUCTOR_ADDED]: AddInstructor,
			[INSTRUCTOR_REMOVED]: RemoveInstructor,
			[EDITORS_LOADED]: EditorsLoaded,
			[EDITOR_ADDED]: AddEditor,
			[EDITOR_REMOVED]: RemoveEditor,
			[USERS_LOADED]: UsersLoaded
		});
	}


	[Loading] () {
		this[Protected].loading = true;

		this.emitChange({type: LOADING});
	}


	[Searching] () {
		this[Protected].searching = true;

		this.emitChange({type: SEARCHING});
	}


	[SetError] (e) {
		const {response} = e.action;

		this[Protected].error = response;

		this.emitChange({type: ERROR});
	}


	[UpdateInstructors] (instructors) {
		const {permissionsList} = this;

		this[Protected].instructors = instructors;

		//If we don't have any active permissions there's nothing to update
		if (!permissionsList.length) { return; }

		const map = getUserMap(instructors);

		const newList = permissionsList.map((permissions) => {
			const {user} = permissions;

			return map[user.getID()] ?
				Permissions.setIsInstructor(permissions, true) :
				Permissions.setIsInstructor(permissions, false);
		});

		this[SetList](newList);
	}


	[UpdateEditors] (editors) {
		const {permissionsList} = this;

		this[Protected].editors = editors;

		//If we don't have any active permissions there's nothing to update
		if (!permissionsList.length) { return; }

		const map = getUserMap(editors);

		const newList = permissionsList.map((permissions) => {
			const {user} = permissions;

			return map[user.getID()] ?
				Permissions.setIsEditor(permissions, true) :
				Permissions.setIsEditor(permissions, false);
		});

		this[SetList](newList);
	}


	[InstructorsLoaded] (e) {
		const {response:instructors} = e.action;
		this[UpdateInstructors](instructors);
	}


	[EditorsLoaded] (e) {
		const {response:editors} = e.action;

		this[UpdateEditors](editors);
	}


	[AddInstructor] (e) {
		const {response:instructor} = e.action;
		const {instructors:oldInstructors} = this[Protected];

		const oldMap = getUserMap(oldInstructors);

		const newInstructors = !oldMap[instructor.getID()] ? [...oldInstructors] : [...oldInstructors, instructor];

		this[UpdateInstructors](newInstructors);
	}


	[AddEditor] (e) {
		const {response:editor} = e.action;
		const {editors:oldEditors} = this[Protected];

		const oldMap = getUserMap(oldEditors);

		const newEditors = !oldMap[editor.getID()] ? [...oldEditors] : [...oldEditors, editor];

		this[UpdateEditors](newEditors);
	}


	[RemoveInstructor] (e) {
		const {response:instructor} = e.action;
		const {instructors:oldInstructors} = this[Protected];

		const newInstructors = oldInstructors.filter(u => u.getID() !== instructor.getID());

		this[UpdateInstructors](newInstructors);
	}


	[RemoveEditor] (e) {
		const {response:editor} = e.action;
		const {editors:oldEditors} = this[Protected];

		const newEditors = oldEditors.filter(u => u.getID() !== editor.getID());

		this[UpdateEditors](newEditors);
	}


	[UsersLoaded] (e) {
		const {response} = e.action;
		//If a falsy response is passed for the users show the managers
		const users = response || this[GetManagers]();

		const {instructors, editors} = this[Protected];
		const instructorMap = getUserMap(instructors);
		const editorMap = getUserMap(editors);

		const list = users.map((u) => new Permissions(u, instructorMap[u.getID()], editorMap[u.getID()]));

		this[SetList](list);
	}


	[GetManagers] () {
		const {instructors, editors} = this[Protected];

		const instructorMap = getUserMap(instructors);

		let users = [...instructors];

		for (let editor of editors) {
			if (!instructorMap[editor.getID()]) {
				users.push(editor);
			}
		}

		return users;
	}


	[SetList] (permissions) {
		this[Protected].permissionsList = permissions;

		this[Protected].loading = false;
		this[Protected].searching = false;

		this.emitChange({type: LIST_UPDATED});
	}


	get loading () {
		return this[Protected].loading;
	}


	get error () {
		return this[Protected].error;
	}


	get permissionsList () {
		return this[Protected].permissionsList;
	}
}

export default new Store();
