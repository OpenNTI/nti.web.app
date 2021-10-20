import { StateStore as Base } from '@nti/web-core/data';
import { getService } from '@nti/web-client';

export class Store extends Base.Behaviors.BatchPaging.Discrete(Base) {
	static hasWebhooks(service) {
		const workspace = service.getWorkspace('zapier');
		return workspace?.hasLink?.('subscriptions');
	}

	async load({ store } = {}) {
		const service = await getService();
		const workspace = service.getWorkspace('zapier');
		if (!workspace?.hasLink?.('subscriptions')) {
			return {
				subscriptions: null,
			};
		}

		const batch = await workspace.fetchLink({
			mode: 'batch',
			rel: 'subscriptions',
			params: store?.params,
		});

		return {
			batch,
		};
	}
}
