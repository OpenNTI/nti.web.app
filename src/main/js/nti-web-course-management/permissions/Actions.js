import {dispatch} from 'nti-lib-dispatcher';
import {getService} from 'nti-web-client';

import {INSTRUCTORS_LOADED, EDITORS_LOADED, RESET_STORE} from './Constants';

const EMPTY_BATCH = {Items: []};

export function resetStore () {
	dispatch(RESET_STORE);
}

export function loadPermissions (course) {
	const instructors = course.getLink('Instructors');
	const editors = course.getLink('Editors');

	getService()
		.then((service) => {
			return Promise.all([
				instructors ? service.getBatch(instructors) : EMPTY_BATCH,
				editors ? service.getBatch(editors) : EMPTY_BATCH
			]);
		}).then(([instructorsBatch, editorsBatch]) => {
			dispatch(INSTRUCTORS_LOADED, instructorsBatch.Items);
			dispatch(EDITORS_LOADED, editorsBatch.Items);
		});
}
