import {getService} from 'nti-web-client';

import BasicStore from '../../BasicStore';

export default class CourseInfoStore extends BasicStore {
	constructor () {
		super();

		this._loading = false;
		this._course = null;
		this._error = null;
	}


	get loading () {
		return this._loading;
	}


	get course () {
		return this._course;
	}


	get error () {
		return this._error;
	}


	async loadCourse (course) {
		if (this.course && course === this.course.getID()) { return; }

		this._course = null;
		this._loading = true;
		this.emitChange('loading');

		try {
			const service = await getService();
			const resolved = await service.getObject(course);

			this._course = resolved;
			this.emitChange('course');
		} catch (e) {
			this._error = e;
			this.emitChange('error');
		} finally {
			this._loading = false;
			this.emitChange('loading');
		}
	}


	unloadCourse (course) {
		if (course !== this.course.getID()) { return; }

		this._course = null;
		this.onChange('course');
	}
}
