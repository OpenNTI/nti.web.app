import React from 'react';

import { Router, Route } from '@nti/web-routing';
import { decodeFromURI } from '@nti/lib-ntiids';

import { Store as Store } from '../Store';
import { DeliveryAttemptHistory } from '../delivery-attempt/DeliveryAttemptHistory';
import { DeliveryAttemptDetail } from '../delivery-attempt/DeliveryAttemptDetail';
import { ErrorBoundary } from '../ErrorBoundary';

import { Item } from './Item';

const useSubscriptionItem = id => {
	const { subscriptions } = Store.useProperties();
	return subscriptions?.find(x => x?.getID?.() === decodeFromURI(id));
};

const FrameContainer = styled.div`
	padding: 0 var(--padding-lg, 1em);
`;

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
	{
		frame: ({ subscriptionId, children }) => {
			const subscription = useSubscriptionItem(subscriptionId);
			return (
				<FrameContainer>
					<ErrorBoundary>
						{React.cloneElement(React.Children.only(children), {
							subscription,
						})}
					</ErrorBoundary>
				</FrameContainer>
			);
		},
	}
);

function Root({ subscription }) {
	return !subscription ? (
		<div>Not Found</div>
	) : (
		<>
			<Item item={subscription} />
			<DeliveryAttemptHistory item={subscription} />
		</>
	);
}
