import React from 'react';

import { Router, Route } from '@nti/web-routing';

import { Store as Store } from '../Store';
import { DeliveryAttemptHistory } from '../delivery-attempt/DeliveryAttemptHistory';
import { DeliveryAttemptDetail } from '../delivery-attempt/DeliveryAttemptDetail';
import { Labeled } from '../parts/Labeled';

import { SubscriptionListItem } from './SubscriptionListItem';

const useSubscriptionItem = id => {
	const { subscriptions } = Store.useProperties();
	return subscriptions?.find(x => x?.getID?.() === id);
};

const FrameContainer = styled.div`
	padding: var(--padding-lg, 1em);
`;

const Frame = ({ id, children }) => {
	const subscription = useSubscriptionItem(id);

	return (
		<FrameContainer>
			<Labeled label="Subscription">
				<SubscriptionListItem item={subscription} />
			</Labeled>
			{React.cloneElement(React.Children.only(children), {
				subscription,
			})}
		</FrameContainer>
	);
};

export const SubscriptionDetail = Router.for(
	[
		Route({
			path: '/:id',
			component: DeliveryAttemptDetail,
			getRouteFor: (obj, context) => {
				if (obj?.isWebhookDeliveryAttempt) {
					return obj.getID();
				}
			},
		}),
		Route({
			path: '/',
			component: Root,
		}),
	],
	{ frame: Frame }
);

function Root({ subscription }) {
	return !subscription ? (
		<div>Not Found</div>
	) : (
		<Labeled label="Delivery Attempts">
			<DeliveryAttemptHistory item={subscription} />
		</Labeled>
	);
}
