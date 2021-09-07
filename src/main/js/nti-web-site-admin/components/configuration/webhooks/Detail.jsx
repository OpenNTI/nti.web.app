import React from 'react';

import { DateTime, useLink } from '@nti/web-core';

import { SubscriptionsStore as Store } from './SubscriptionsStore';

export function SubscriptionDetail ({id}) {
	const { subscriptions } = Store.useProperties();
	const item = subscriptions?.find(x => x?.getID?.() === id);

	return !item ? <div>Not Found</div> : (
		<div>
			<div>{id}</div>
			<History item={item} />
		</div>
	);
}

function History ({item}) {
	const {Items: items} = useLink(item, 'delivery_history');

	return (
		<ul>{items.map(x => !x ? null : <li key={x.getID()}><DeliveryAttempt item={x} /></li>)}</ul>
	)
}

const Card = styled.div`
	border: 1px solid red;
`

function DeliveryAttempt ({item}) {
	return (
		<Card>
			<DateTime date={item.getCreatedTime?.()} />
			<div>{item.status}</div>
			<div>{item.message}</div>
		</Card>
	)
}
