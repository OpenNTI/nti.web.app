import React from 'react';

import { Router, Route } from '@nti/web-routing';

import { SubscriptionsStore as Store } from './SubscriptionsStore';
import { History } from './DeliveryAttemptHistory';
import { DeliveryAttemptDetail } from './DeliveryAttemptDetail';

const useSubscriptionItem = (id) => {
	const { subscriptions } = Store.useProperties();
	return subscriptions?.find(x => x?.getID?.() === id);
}

export const SubscriptionDetail = Router.for(
	[
		Route({
			path: '/:id',
			component: DeliveryAttemptDetail,
			getRouteFor: (obj, context) => {
				if (obj?.isWebhookDeliveryAttempt) {
					return obj.getID();
				}
			}
		}),
		Route({
			path: '/',
			component: Detail,
		}),
	],
);


function Detail ({id}) {
	const item = useSubscriptionItem(id);

	return !item ? <div>Not Found</div> : (
		<div>
			<div>Delivery History</div>
			<History item={item} />
		</div>
	);
}
