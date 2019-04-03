import {Stores} from '@nti/lib-store';

import BaseModel from 'legacy/model/Base';

async function getActiveUsers (topic) {
	return null;
}

export default class NTIWebAppLessonItemsTopicStore extends Stores.BoundStore {
	async load () {
		const {topicRef, course} = this.binding;

		if (topicRef === this.topicRef) { return; }

		this.topicRef = topicRef;

		this.set({
			loading: true,
			topicModel: null,
			activeUsers: null
		});

		try {
			const resolved = await topicRef.resolveTarget(course);
			const activeUsers = await getActiveUsers(resolved);

			this.set({
				loading: false,
				topicModel: BaseModel.interfaceToModel(resolved),
				activeUsers
			});
		} catch (e) {
			this.set({
				loading: false,
				error: e
			});
		}
	}
}
