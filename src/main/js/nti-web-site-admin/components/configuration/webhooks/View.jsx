import { Router, Route } from '@nti/web-routing';

import { Frame } from './Frame';
import { List } from './List';
import { SubscriptionDetail } from './Detail';

export const Webhooks = Router.for(
	[
		Route({
			path: '/:id',
			component: SubscriptionDetail,
			getRouteFor: (obj, context) => {
				if (obj?.isPersistentSubscription) {
					return obj.getID();
				}
			}
		}),
		Route({
			path: '/',
			component: List,
		}),
	],
	{ frame: Frame }
);
