import {Stores} from '@nti/lib-store';
import {getService} from '@nti/web-client';
import {UserDataThreader} from '@nti/lib-interfaces';
import {isNTIID} from '@nti/lib-ntiids';

import BaseModel from 'legacy/model/Base';

async function resolvePageInfo (page, course) {
	const id = isNTIID(page.href) ? page.href : (page['target-NTIID'] || page['Target-NTIID'] || page.getID());

	try {
		const service = await getService();
		const pageInfo = await service.getPageInfo(id, {
			params: {
				course: course.getID()
			}
		});

		return BaseModel.interfaceToModel(pageInfo);
	} catch (e) {
		return page.isContent ? null : BaseModel.interfaceToModel(page);
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
			notes: null,
			notFound: false
		});

		try {
			const bundle = BaseModel.interfaceToModel(course);
			const pageInfo = await resolvePageInfo(page, course);

			if (!pageInfo) {
				this.set({
					loading: false,
					bundle,
					notFound: true
				});
			}

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
			const converted = UserDataThreader.threadThreadables(
				await Promise.all(
					flatten(notes)
						.filter(n => !n.placeholder)
						.map(note => note.getInterfaceInstance())
				)
			).sort((a, b) => b.getLastModified() - a.getLastModified());

			this.set({
				notes: converted
			});
		} catch (e) {
			//swallow
		}
	}
}


function flatten (notes) {

	return flattenArray(
		([
			notes,
			(notes || []).map(note => flatten(note.children))
		])
			.filter(Boolean)
	);
}

function flattenArray (arr) {
	if (typeof arr.flat === 'function') { return arr.flat(Infinity); }

	return arr.reduce((acc, val) => {
		const flat = Array.isArray(val) ? flattenArray(val) : val;

		return acc.concat(flat);
	}, []);
}
