import {Stores} from '@nti/lib-store';
import {parseNTIID} from '@nti/lib-ntiids';
import {getService} from '@nti/web-client';

import BaseModel from 'legacy/model/Base';

const SPECIAL_ID_REGEX = /^Topic:EnrolledCourse(Section|Root)$/;

//TODO: move this to a shared place
function maybeFixNTIID (ntiid, course) {
	const parts = parseNTIID(ntiid);
	const catalogEntry = course && course.CatalogEntry;

	/*
	 * Here is a hack.  The crux of which is to supply context about the subinstance we are in
	 * when we resolving a topic. We do this primarily for instructors who may instruct multiple
	 * subinstances that contain this discussion although strickly speaking it coudl happen for any
	 * account type if the account is enrolled in multiple subinstances of a course that contain
	 * the same named topic.	 The issue is without the contexxt of the course we are in when the topic
	 * is selected on the overview the server as multiple topics to choose from (one for each section)
	 * and it is ambiguous as to which one to select.  Now the problem with this particular hack
	 * is that when we are in a section but trying to get to the root (because the topics are set up
	 * in the root rather than the section) the provider id no longer matches the root and we 404.  In most
	 * cases the section is what contains the topic making this a non issue, but we now have courses where
	 * the topic only exists in the parent.	We need another way to pass the context of the such that we
	 * get the proper context in the event it is ambiguous.	While we have this in the context of a course (from
	 * the overview or content) we aren't going to have this in the stream right?  I think this manifests
	 * as course roulette but that is already a problem right?
	 */

	if (catalogEntry && parts && SPECIAL_ID_REGEX.test(parts.specific.type)) {
		parts.specific.$$provider = (catalogEntry.ProviderUniqueID || '').replace(/[\W-]/g, '_');
	}

	return parts.toString();
}

async function resolveTopic (ntiids, course) {
	const id = ntiids[0];

	if (!id) { throw new Error('Unable to resolve topic'); }

	try {
		const service = await getService();
		const topic = await service.getObject(maybeFixNTIID(id, course));

		return topic;
	} catch (e) {
		return resolveTopic(ntiids.slice(1), course);
	}
}


export default class NTIWebAppLessonItemsTopicStore extends Stores.BoundStore {
	async load () {
		const {topic, course} = this.binding;

		if (topic === this.topic) { return; }

		this.topic = topic;

		this.set({
			loading: true,
			topic: null
		});

		try {
			const ntiids = topic.NTIID ? topic.NTIID.split(' ') : [];
			const resolved = await resolveTopic(ntiids, course);

			this.set({
				loading: false,
				topicModel: BaseModel.interfaceToModel(resolved)
			});
		} catch (e) {
			this.set({
				loading: false,
				error: e
			});
		}
	}
}
