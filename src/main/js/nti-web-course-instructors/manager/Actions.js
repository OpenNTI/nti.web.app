import {dispatch} from 'nti-lib-dispatcher';
import {getService} from 'nti-web-client';

import {INSTRUCTORS_LOADED} from './Constants';

export function loadInstructors (course) {
	const link = course.getLink('Instructors');

	if (link) {
		getService()
			.then(service => service.get(link))
			.then((batch) => {
				dispatch(INSTRUCTORS_LOADED, batch.Items);
			});
	}
}
