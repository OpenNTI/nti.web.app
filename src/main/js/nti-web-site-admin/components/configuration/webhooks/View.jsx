import { Router, Route } from '@nti/web-routing';

import { Frame } from './Frame';
import { SubscriptionList } from './subscriptions/SubscriptionList';
import { SubscriptionDetail } from './subscriptions/SubscriptionDetail';

export const Webhooks = Router.for(
	[
		Route({
			path: '/:id',
			component: SubscriptionDetail,
			getRouteFor: (obj, context) => {
				if (obj?.isPersistentSubscription) {
					return obj.getID();
				}
			},
		}),
		Route({
			path: '/',
			component: SubscriptionList,
		}),
	],
	{ frame: Frame }
);
