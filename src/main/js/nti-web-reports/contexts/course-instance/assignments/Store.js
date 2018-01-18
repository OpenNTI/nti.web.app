import {Stores} from 'nti-lib-store';

export default class CourseAssignmentStore extends Stores.SimpleStore {
	constructor () {
		super();

		this.set('items', []);
		this.set('loading', false);
	}

	async load (course) {
		if (course === this.get('course')) { return; }

		this.set('course', course);
		this.set('loading', true);
		this.emitChange('loading', 'course');

		try {
			const assignmentCollection = await course.getAssignments();

			this.set('items', assignmentCollection.getAssignments());
			this.set('loading', false);
			this.emitChange('items', 'loading');
		} catch (e) {
			this.set('error', true);
			this.set('loading', true);
			this.emitChnage('error', 'loading');
		}
	}
}
