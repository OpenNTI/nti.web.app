import React from 'react';

import { Router, Route } from '@nti/web-routing';
import { decodeFromURI } from '@nti/lib-ntiids';
import { ErrorBoundary } from '@nti/web-core';
import { EmptyState } from '@nti/web-commons';

import { Store } from '../Store';
import { DeliveryAttemptHistory } from '../delivery-attempt/DeliveryAttemptHistory';
import { DeliveryAttemptDetail } from '../delivery-attempt/DeliveryAttemptDetail';

import { Meta } from './Meta';

const useSubscriptionItem = id => {
	const { items } = Store.useProperties();
	return items?.find(x => x?.getID?.() === decodeFromURI(id));
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
		<EmptyState>Not Found</EmptyState>
	) : (
		<>
			<Meta item={subscription} />
			<DeliveryAttemptHistory item={subscription} />
		</>
	);
}
