import { getService } from '@nti/web-client';
import { Stores } from '@nti/lib-store';
import { decodeFromURI } from '@nti/lib-ntiids';

export default class EnrollmentStore extends Stores.SimpleStore {
	constructor() {
		super();

		this.set('loading', false);
		this.set('enrollment', null);
		this.set('course', null);
		this.set('error', null);
	}

	get enrollment() {
		return this.get('enrollment');
	}

	getEnrollment(service, enrollmentID) {
		return service.getObject(enrollmentID).then(enrollment => {
			return enrollment;
		});
	}

	async loadBook(bookID, userID) {
		this.set('book', null);
		this.set('user', null);
		this.set('loading', true);
		this.emitChange('loading');

		try {
			const decodedID = decodeFromURI(bookID);
			const service = await getService();
			const user = await service.resolveEntity(userID);
			const bookRecords = await user.fetchLinkParsed('UserBundleRecords');

			const matches = (bookRecords || []).filter(
				rec => rec.Bundle.NTIID === decodedID
			);

			this.set('userBookRecord', matches[0]);
			this.set('loading', false);
			this.emitChange('loading', 'userBookRecord');
		} catch (e) {
			this.set('userBookRecord', null);
			this.set('error', e.message || e);
			this.set('loading', false);
			this.emitChange('loading', 'userBookRecord');
		}
	}
}
