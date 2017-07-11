const USER = Symbol('User');
const INSTRUCTOR = Symbol('Instructor');
const EDITOR = Symbol('Editor');

export default class Permissions {
	static setIsInstructor (permissions, isInstructor) {
		return new Permissions(permissions.user, isInstructor, permissions.isEditor);
	}

	static setIsEditor (permissions, isEditor) {
		return new Permissions(permissions.user, permissions.isInstructor, isEditor);
	}

	constructor (user, isInstructor, isEditor) {
		this[USER] = user;
		this[INSTRUCTOR] = isInstructor;
		this[EDITOR] = isEditor;
	}

	get id () {
		return this.user.getID();
	}

	get user () {
		return this[USER];
	}

	get isInstructor () {
		return this[INSTRUCTOR];
	}

	get isEditor () {
		return this[EDITOR];
	}
}
