import path from 'path';

import {dispatch} from '@nti/lib-dispatcher';
import {getService} from '@nti/web-client';

import {
	LOADING,
	SEARCHING,
	ERROR,
	INSTRUCTORS_LOADED,
	INSTRUCTOR_ADDED,
	INSTRUCTOR_REMOVED,
	EDITORS_LOADED,
	EDITOR_ADDED,
	EDITOR_REMOVED,
	USERS_LOADED,
	USER_UPDATING,
	USER_UPDATED
} from './Constants';

const EMPTY_BATCH = {Items: []};

let SEARCH_LOCK;

function loadBatch (link) {
	return link ?
		getService().then(s => s.getBatch(link)).catch(() => EMPTY_BATCH) :
		Promise.resolve(EMPTY_BATCH);
}

function loadInstructors (course) {
	return loadBatch(course.getLink('Instructors'))
		.then((batch) => {
			dispatch(INSTRUCTORS_LOADED, batch.Items.filter(x => x));
		});
}

function loadEditors (course) {
	return loadBatch(course.getLink('Editors'))
		.then((batch) => {
			dispatch(EDITORS_LOADED, batch.Items.filter(x => x));
		});
}

function clearErrors () {
	dispatch(ERROR, null);
}

export function loadManagers (course) {
	dispatch(LOADING);

	Promise.all([
		loadInstructors(course),
		loadEditors(course)
	])
		.then(() => {
			dispatch(USERS_LOADED, null);
		});
}


export function searchUsers (term) {
	const lock = Date.now();
	SEARCH_LOCK = lock;

	if (!term) {
		return dispatch(USERS_LOADED, null);
	}

	clearErrors();
	dispatch(SEARCHING);

	getService()
		.then(s => s.getContacts())
		.then((contacts) => {
			return contacts.search(term, false, true)
				.then((results) => {
					if (lock !== SEARCH_LOCK) {
						return;
					}

					const users = results.filter(entity => entity.isUser );

					dispatch(USERS_LOADED, users);
				});
		});
}


export function addInstructor (permissions, course) {
	if (permissions.isInstructor) { return; }

	const link = course.getLink('Instructors');
	const {user} = permissions;

	clearErrors();
	dispatch(USER_UPDATING, user);

	getService()
		.then(service => service.post(link, {user: user.getID()}))
		.then(() => {
			dispatch(USER_UPDATED, user);
			dispatch(INSTRUCTOR_ADDED, user);
		})
		.catch((err) => {
			dispatch(USER_UPDATED, user);
			dispatch(ERROR, err);
		});
}


export function removeInstructor (permissions, course) {
	if (!permissions.isInstructor) { return; }

	const link = course.getLink('Instructors');
	const {user} = permissions;

	clearErrors();
	dispatch(USER_UPDATING, user);


	getService()
		.then((service) => service.delete(path.join(link, user.getID())))
		.then(() => {
			dispatch(USER_UPDATED, user);
			dispatch(INSTRUCTOR_REMOVED, user);
		})
		.catch((err) => {
			dispatch(USER_UPDATED, user);
			dispatch(ERROR, err);
		});
}


export function addEditor (permissions, course) {
	if (permissions.isEditor) { return; }

	const link = course.getLink('Editors');
	const {user} = permissions;

	clearErrors();
	dispatch(USER_UPDATING, user);

	getService()
		.then(service => service.post(link, {user: user.getID()}))
		.then(() => {
			dispatch(USER_UPDATED, user);
			dispatch(EDITOR_ADDED, user);
		})
		.catch((err) => {
			dispatch(USER_UPDATED, user);
			dispatch(ERROR, err);
		});
}


export function removeEditor (permissions, course) {
	if (!permissions.isEditor) { return; }

	const link = course.getLink('Editors');
	const {user} = permissions;

	clearErrors();
	dispatch(USER_UPDATING, user);


	getService()
		.then((service) => service.delete(path.join(link, user.getID())))
		.then(() => {
			dispatch(USER_UPDATED, user);
			dispatch(EDITOR_REMOVED, user);
		})
		.catch((err) => {
			dispatch(USER_UPDATED, user);
			dispatch(ERROR, err);
		});
}
