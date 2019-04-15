import {Stores} from '@nti/lib-store';
import {User} from '@nti/web-client';

import BaseModel from 'legacy/model/Base';

const MAX_ACTIVE_USERS = 5;
const ACTIVE_USER_PARAMS = {
	batchSize: 50,
	sortOn: 'CreatedTime',
	sortOrder: 'ascending'
};

async function getActiveUsers (topic) {
	try {
		const batch = await topic.fetchLink('contents', ACTIVE_USER_PARAMS);
		const {Items:comments} = batch;
		const activeSet = new Set();

		for (let comment of comments) {
			activeSet.add(comment.Creator);

			if (activeSet.size > MAX_ACTIVE_USERS) {
				break;
			}
		}

		const users = Array.from(activeSet);

		return Promise.all(
			users.map(user => User.resolve({entity: user}))
		);
	} catch (e) {
		return [];
	}
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
