import { StateStore } from '@nti/web-core/data';

export class Store extends StateStore.Behaviors.BatchPaging.Discrete(
	StateStore
) {
	async load({ store }) {
		const { user, ...params } = store?.params || {};
		try {
			const batch = await user.fetchLink({
				rel: 'UserEnrollments',
				mode: 'batch',
				throwMissing: false,
				params: params,
			});

			return {
				batch,
			};
		} catch (e) {
			const results = { batch: void 0, error: void 0 };
			// we shouldn't show error info for this, just means no enrolled courses and the view will reflect that
			if (e.code !== 'UserEnrollmentsNotFound') {
				results.error = e;
			}

			return results;
		}
	}

	onEnrollmentChange() {
		this.reload();
	}
}
