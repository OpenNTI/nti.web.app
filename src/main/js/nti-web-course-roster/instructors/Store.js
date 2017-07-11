import StorePrototype from 'nti-lib-store';

import Permissions from './Permissions';
import {
	LOADING,
	LOADED,
	MANAGERS_LOADED,
	PERMISSIONS_UPDATED
} from './Constants';

const Protected = Symbol('Protected');

const Loading = Symbol('Loading');
const Loaded = Symbol('Loaded');

const ManagersLoaded = Symbol('Instructors Loaded');
const SetPermissions = Symbol('SetPermissions');

function init (store) {
	store[Protected] = {
		loading: false,
		instructors: null,
		editors: null,
		permissionsList: []
	};
}


class Store extends StorePrototype {
	constructor () {
		super();

		init(this);

		this.registerHandlers({
			[LOADING]: Loading,
			[MANAGERS_LOADED]: ManagersLoaded
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


	[ManagersLoaded] (e) {
		const {response} = e.action;
		const {instructors, editors} = response;

		let instructorMap = {};
		let editorMap = {};
		let users = [];

		for (let instructor of instructors) {
			instructorMap[instructor.getID()] = true;

			users.push(instructor);
		}

		for (let editor of editors) {
			editorMap[editor.getID()] = true;

			if (!instructorMap[editor.getID()]) {
				users.push(editor);
			}
		}

		this[SetPermissions](users.map(u => new Permissions(u, instructorMap[u.getID()], editorMap[u.getID()])));

		if (this.loading) {
			this[Loaded]();
		}
	}


	[SetPermissions] (permissions) {
		//TODO: sort permissions;
		this[Protected].permissionList = permissions;

		this.emitChange({type: PERMISSIONS_UPDATED});
	}


	get loading () {
		return this[Protected].loading;
	}


	get permissions () {
		return this[Protected].permissionList;
	}
}

export default new Store();
