import { StateStore } from '@nti/web-core/data';
import { getService } from '@nti/web-client';

export class SubscriptionsStore extends StateStore {
	async load () {
		const service = await getService();
		const workspace = service.getWorkspace('zapier');
		if (!workspace?.hasLink?.('subscriptions')) {
			return {}
		}

		const subscriptions = await workspace.fetchLinkParsed('subscriptions');

		return {
			subscriptions
		}
	}
}
