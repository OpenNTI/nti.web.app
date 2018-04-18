import {getService} from '@nti/web-client';
import {Stores} from '@nti/lib-store';
import {decodeFromURI} from '@nti/lib-ntiids';

export default class EnrollmentStore extends Stores.SimpleStore {
	constructor () {
		super();

		this.set('loading', false);
		this.set('enrollment', null);
		this.set('course', null);
		this.set('error', null);
	}

	get enrollment () {
		return this.get('enrollment');
	}

	getEnrollment (service, enrollmentID) {
		return service.getObject(enrollmentID).then(enrollment => {
			return enrollment;
		});
	}

	loadEnrollment (enrollmentID) {
		const decodedID = decodeFromURI(enrollmentID);

		if (this.enrollment && decodedID === this.enrollment.getID()) { return; }

		this.doLoad(decodedID);
	}

	async doLoad (enrollmentID) {
		this.set('enrollment', null);
		this.set('course', null);
		this.set('loading', true);
		this.emitChange('loading');

		try {
			const service = await getService();
			const enrollment = await this.getEnrollment(service, enrollmentID);
			const course = await enrollment.fetchLinkParsed('CourseInstance');

			this.set('enrollment', enrollment);
			this.set('course', course);
			this.emitChange('enrollment', 'course');
		} catch (e) {
			this.set('error', e);
			this.emitChange('error');
		} finally {
			this.set('loading', false);
			this.emitChange('loading');
		}
	}
}
