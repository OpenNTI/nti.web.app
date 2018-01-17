import {Stores} from 'nti-lib-store';

export default class CourseAssignmentStore extends Stores.SimpleStore {
	load (course) {
		if (course === this.get('course')) { return; }

		debugger;
	}
}
