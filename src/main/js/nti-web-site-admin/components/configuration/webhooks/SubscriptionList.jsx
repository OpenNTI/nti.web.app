import React from 'react';

import { LinkTo } from '@nti/web-routing';
import { List } from '@nti/web-commons';

import { SubscriptionsStore as Store } from './SubscriptionsStore';
import { SubscriptionListItem } from './SubscriptionListItem';

const Item = styled('li')`
	&:not(:last-child) {
		box-shadow: 0 1px 0 var(--color-outline-light);
	}
`;

export function SubscriptionList(props) {
	const { subscriptions } = Store.useProperties();

	return (
		<List.Unadorned>
			{subscriptions?.map(item => (
				<Item key={item.getID()}>
					<LinkTo.Object object={item}>
						<SubscriptionListItem item={item} />
					</LinkTo.Object>
				</Item>
			))}
		</List.Unadorned>
	);
}
