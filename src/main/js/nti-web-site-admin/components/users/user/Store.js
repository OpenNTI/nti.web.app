import { User } from '@nti/web-client';
import { StateStore } from '@nti/web-core/data';

export class Store extends StateStore.Behaviors.BatchPaging.Discrete(
	StateStore
) {
	async load({ store }) {
		const { userID } = store?.params || {};
		try {
			const user = await User.resolve({ entity: userID });
			const bookRecords = await user.fetchLink({
				throwMissing: false,
				mode: 'raw',
				rel: 'UserBundleRecords',
			});

			const hasBooks = bookRecords?.Items?.length > 0;
			let hasCourses = true; // inexpensive way to know this?  for now, always true

			return {
				user,
				hasBooks,
				hasCourses,
			};
		} catch (e) {
			return { error: e, user: null };
		}
	}
}
