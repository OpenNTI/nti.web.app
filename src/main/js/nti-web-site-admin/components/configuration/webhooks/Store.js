import { StateStore } from '@nti/web-core/data';
import { getService } from '@nti/web-client';

export class Store extends StateStore {
	static hasWebhooks(service) {
		const workspace = service.getWorkspace('zapier');
		return workspace?.hasLink?.('subscriptions');
	}

	async load() {
		const service = await getService();
		const workspace = service.getWorkspace('zapier');
		if (!workspace?.hasLink?.('subscriptions')) {
			return {
				subscriptions: null,
			};
		}

		const subscriptions = await workspace.fetchLink('subscriptions');

		return {
			subscriptions,
		};
	}
}
