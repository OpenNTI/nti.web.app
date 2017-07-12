import {dispatch} from 'nti-lib-dispatcher';
import {getService} from 'nti-web-client';

import {
	LOADING,
	SEARCHING,
	INSTRUCTORS_LOADED,
	EDITORS_LOADED,
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
