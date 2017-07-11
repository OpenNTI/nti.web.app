import {dispatch} from 'nti-lib-dispatcher';
import {getService} from 'nti-web-client';

import {
	LOADING,
	MANAGERS_LOADED
} from './Constants';

const EMPTY_BATCH = {Items: []};

export function loadManagers (course) {
	const instructorsLink = course.getLink('Instructors');
	const editorsLink = course.getLink('Editors');

	dispatch(LOADING);

	return getService()
		.then((service) => {
			return Promise.all([
				instructorsLink ? service.getBatch(instructorsLink) : EMPTY_BATCH,
				editorsLink ? service.getBatch(editorsLink) : EMPTY_BATCH
			]);
		})
		.then((results) => {
			dispatch(MANAGERS_LOADED, {
				instructors: results[0].Items,
				editors: results[1].Items
			});
		});
}
