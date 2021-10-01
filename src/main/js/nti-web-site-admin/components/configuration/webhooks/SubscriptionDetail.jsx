import React from 'react';

import { Router, Route } from '@nti/web-routing';

import { SubscriptionsStore as Store } from './SubscriptionsStore';
import { DeliveryAttemptHistory } from './DeliveryAttemptHistory';
import { DeliveryAttemptDetail } from './DeliveryAttemptDetail';
import { SubscriptionListItem } from './SubscriptionListItem';
import { Labeled } from './Labeled';

const useSubscriptionItem = (id) => {
	const { subscriptions } = Store.useProperties();
	return subscriptions?.find(x => x?.getID?.() === id);
}

const FrameContainer = styled.div`
	padding: var(--padding-lg, 1em);
`

const Frame = ({ id, children }) => {
	const subscription = useSubscriptionItem(id);

	return (
		<FrameContainer>
			<Labeled label="Subscription">
				<SubscriptionListItem item={subscription} />
			</Labeled>
			{React.cloneElement(React.Children.only(children), { subscription } )}
		</FrameContainer>
	);
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
	{ frame: Frame }
);


function Detail ({subscription}) {
	return !subscription ? <div>Not Found</div> : (
		<Labeled label="Delivery Attempts">
			<DeliveryAttemptHistory item={subscription} />
		</Labeled>
	);
}
