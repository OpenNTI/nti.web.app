import StorePrototype from 'nti-lib-store';

import Permissions from './Permissions';
import {
	LOADING,
	SEARCHING,
	INSTRUCTORS_LOADED,
	EDITORS_LOADED,
	USERS_LOADED,
	LIST_UPDATED
} from './Constants';

const Protected = Symbol('Protected');

const Loading = Symbol('Loading');
const Searching = Symbol('Searching');
const InstructorsLoaded = Symbol('Instructors Loaded');
const EditorsLoaded = Symbol('Editors Loaded');
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
			[INSTRUCTORS_LOADED]: InstructorsLoaded,
			[EDITORS_LOADED]: EditorsLoaded,
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


	[InstructorsLoaded] (e) {
		const {response:instructors} = e.action;
		const {permissionsList} = this;

		this[Protected].instructors = instructors;

		//If we don't have any active permissions there's nothing to update
		if (!permissionsList.length) { return; }

		const instructorMap = getUserMap(instructors);

		const newList = permissionsList.map((permissions) => {
			const {user} = permissions;

			return instructorMap[user.getID()] ?
				Permissions.setIsInstructor(permissions, true) :
				Permissions.setIsInstructor(permissions, false);
		});

		this[SetList](newList);
	}


	[EditorsLoaded] (e) {
		const {response:editors} = e.action;
		const {permissionsList} = this;

		this[Protected].editors = editors;

		//If we don't have any active permissions there's nothing to update
		if (!permissionsList.length) { return; }

		const editorMap = getUserMap(editors);

		const newList = permissionsList.map((permissions) => {
			const {user} = permissions;

			return editorMap[user.getID()] ?
				Permissions.setIsEditor(permissions, true) :
				Permissions.setIsInstructor(permissions, false);
		});

		this[SetList](newList);
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


	get permissionsList () {
		return this[Protected].permissionsList;
	}
}

export default new Store();
