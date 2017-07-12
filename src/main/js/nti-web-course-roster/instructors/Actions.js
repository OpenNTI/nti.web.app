import path from 'path';

import {dispatch} from 'nti-lib-dispatcher';
import {getService} from 'nti-web-client';

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
	USERS_LOADED
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
			dispatch(INSTRUCTORS_LOADED, batch.Items);
		});
}

function loadEditors (course) {
	return loadBatch(course.getLink('Editors'))
		.then((batch) => {
			dispatch(EDITORS_LOADED, batch.Items);
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
			return contacts.search(term)
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

	clearErrors();
	const link = course.getLink('Instructors');

	getService()
		.then(service => service.post(link, {user: permissions.id}))
		.then(() => dispatch(INSTRUCTOR_ADDED, permissions.user))
		.catch((err) => dispatch(ERROR, err));
}


export function removeInstructor (permissions, course) {
	if (!permissions.isInstructor) { return; }

	clearErrors();
	const link = course.getLink('Instructors');

	getService()
		.then((service) => service.delete(path.join(link, permissions.user.getID())))
		.then(() => dispatch(INSTRUCTOR_REMOVED, permissions.user))
		.catch((err) => dispatch(ERROR, err));
}


export function addEditor (permissions, course) {
	if (permissions.isEditor) { return; }

	clearErrors();
	const link = course.getLink('Editors');

	getService()
		.then(service => service.post(link, {user: permissions.id}))
		.then(() => dispatch(EDITOR_ADDED, permissions.user))
		.catch((err) => dispatch(ERROR, err));
}


export function removeEditor (permissions, course) {
	if (!permissions.isEditor) { return; }

	clearErrors();
	const link = course.getLink('Editors');

	getService()
		.then((service) => service.delete(path.join(link, permissions.user.getID())))
		.then(() => dispatch(EDITOR_REMOVED, permissions.user))
		.catch((err) => dispatch(ERROR, err));
}
