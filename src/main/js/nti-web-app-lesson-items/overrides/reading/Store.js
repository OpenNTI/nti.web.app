import {Stores} from '@nti/lib-store';
import {getService} from '@nti/web-client';

import BaseModel from 'legacy/model/Base';

async function resolvePageInfo (page, course) {
	const id = page['target-NTIID'] || page.getID();

	try {
		const service = await getService();
		const pageInfo = await service.getPageInfo(id, {
			params: {
				course: course.getID()
			}
		});

		return BaseModel.interfaceToModel(pageInfo);
	} catch (e) {
		return BaseModel.interfaceToModel(page);
	}
}

function getRootId (parents = [], page) {
	for (let parent of parents) {
		const id = parent.getID && parent.getID();

		if (id) { return id; }
	}

	return page && page.getId();
}

export default class NTIWebAppLessonItemsReadingStore extends Stores.BoundStore {

	async load () {
		const {course, page, parents} = this.binding;

		if (this.course === course && this.page === page) { return; }

		this.course = course;
		this.page = page;
		this.parents = parents;

		this.set({
			loading: true,
			bundle: null,
			page: null,
			notes: null
		});

		try {
			const bundle = BaseModel.interfaceToModel(course);
			const pageInfo = await resolvePageInfo(page, course);
			const contentPackage = pageInfo && pageInfo.getContentPackage ? await pageInfo.getContentPackage() : null;

			if (contentPackage) {
				bundle.syncContentPackage(contentPackage);
			}

			this.set({
				loading: false,
				bundle,
				page: pageInfo,
				rootId: getRootId(parents, pageInfo),
				contentPackage
			});
		} catch (e) {
			this.set({
				loading: false,
				error: e
			});
		}
	}


	setNotes (notes) {
		this.rawNotes = notes;

		if (this.setNotesTimeout) { return; }

		this.setNotesTimeout = setTimeout(() => {
			delete this.setNotesTimeout;
			this.convertNotes(this.rawNotes);
		}, 100);
	}


	async convertNotes (notes) {
		try {
			const converted = await Promise.all(
				notes.map(note => note.getInterfaceInstance())
			);

			this.set({
				notes: converted
			});
		} catch (e) {
			//swallow
		}
	}
}
