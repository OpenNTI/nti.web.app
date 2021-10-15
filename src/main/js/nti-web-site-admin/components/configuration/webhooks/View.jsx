import { Box } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';
import { Router, Route } from '@nti/web-routing';

import { Store } from './Store';
import { SubscriptionList } from './subscriptions/SubscriptionList';
import { SubscriptionDetail } from './subscriptions/SubscriptionDetail';
import { Breadcrumb } from './parts/Breadcrumb';

export const Webhooks = Router.for(
	[
		Route({
			path: '/:subscriptionId',
			component: SubscriptionDetail,
			getRouteFor: (obj, context) => {
				if (obj?.isPersistentSubscription) {
					return obj.getID();
				}
			},
		}),
		Route({
			path: '/',
			name: 'site-admins.config.webhooks',
			component: SubscriptionList,
		}),
	],
	{
		frame: ({ children }) => {
			return (
				<Box p="lg" sh="sm">
					<Breadcrumb />
					<DataContext store={Store.useStore()} fallback={<div />}>
						{children}
					</DataContext>
				</Box>
			);
		},
	}
);
