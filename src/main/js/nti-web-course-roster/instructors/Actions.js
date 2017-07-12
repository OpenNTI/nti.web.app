import {dispatch} from 'nti-lib-dispatcher';
import {getService} from 'nti-web-client';

import {
	LOADING,
	INSTRUCTORS_LOADED,
	EDITORS_LOADED,
	USERS_LOADED
} from './Constants';

const EMPTY_BATCH = {Items: []};

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
