import {dispatch} from 'nti-lib-dispatcher';
import {getService} from 'nti-web-client';

import {
	LOADING,
	INSTRUCTORS_LOADED,
	EDITORS_LOADED,
	// STUDENTS_LOADED
} from './Constants';


function getSearchFn (term) {
	return (user) => {
		return true; //TODO: wire up search
	};
}

function loadBatch (link, course, searchTerm, page) {
	if (!link) {
		return Promise.resolve({searchTerm, page, Items: []});
	}

	return getService()
		.then(service => service.getBatch(link, course))
		.then(({Items}) => {
			const searchFn = getSearchFn(searchTerm);

			return {
				searchTerm,
				page,
				TotalPages: 1,
				Items: Items.filter(searchFn)
			};
		});
}

export function loadInstructors (course, searchTerm, page) {
	const link  = course.getLink('Instructors');

	dispatch(LOADING);

	loadBatch(link, course, searchTerm, page)
		.then(batch => dispatch(INSTRUCTORS_LOADED, batch));
}

export function loadEditors (course, searchTerm, page) {
	const link = course.getLink('Editors');

	dispatch(LOADING);

	loadBatch(link, course, searchTerm, page)
		.then(batch => dispatch(EDITORS_LOADED, batch));
}


export function loadStudents (course, searchTerm, page) {
	//TODO: load the roster
}
