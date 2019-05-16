import {Stores} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {isNTIID} from '@nti/lib-ntiids';

async function resolveContentPackage (page, course) {
	const id = isNTIID(page.href) ? page.href : (page['target-NTIID'] || page['Target-NTIID'] || page.getID());

	try {
		const service = await getService();
		const pageInfo = await service.getPageInfo(id, { params: { course: course.getID() }	});
		const contentPackage = await pageInfo.getContentPackage();

		return contentPackage || null;
	} catch (e) {
		return null;
	}
}

async function getEditable (page, course) {
	try {
		const contentPackage = await resolveContentPackage(page, course);

		if (contentPackage) { return contentPackage; }

		return page.isContent ? null : page;
	} catch (e) {
		return null;
	}
}

export default class NTIWebAppLessonItemsReadingEditorStore extends Stores.BoundStore {
	async load () {
		const {course, page} = this.binding;

		if (this.course === course && this.page === page) { return; }

		this.course = course;
		this.page = page;


		this.set({
			error: null,
			loading: true,
			page: null
		});

		try {
			const editablePage = await getEditable(page, course);

			this.set({
				loading: false,
				page: editablePage
			});
		} catch (e) {
			this.set({
				error: e,
				loading: false
			});
		}
	}
}
