import {getService} from '@nti/web-client';
import {Stores} from '@nti/lib-store';

export default class CourseInfoStore extends Stores.SimpleStore {
	constructor () {
		super();

		this.set('loading', false);
		this.set('course', null);
		this.set('error', null);
	}


	get course () {
		return this.get('course');
	}


	async loadCourse (course) {
		if (this.course && course === this.course.getID()) { return; }

		this.set('course', null);
		this.set('loading', true);
		this.emitChange('loading');

		try {
			const service = await getService();
			const resolved = await service.getObject(course);

			this.set('course', resolved);
			this.emitChange('course');
		} catch (e) {
			this.set('error', e);
			this.emitChange('error');
		} finally {
			this.set('loading', false);
			this.emitChange('loading');
		}
	}


	unloadCourse (course) {
		if (this.course && course !== this.course.getID()) { return; }

		this.set('course', null);
		this.onChange('course');
	}
}
