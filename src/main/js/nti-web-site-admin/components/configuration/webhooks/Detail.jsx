import React from 'react';

import { Hooks } from '@nti/web-commons';

const { useResolver } = Hooks;
const { isResolved } = useResolver;

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
	const resolver = useResolver(async () => {
		return item.fetchLinkParsed('delivery_history');
	})
	return !isResolved(resolver) ? null : (
		<div>
			<pre>{JSON.stringify(resolver, null, 2)}</pre>
			<ul>{resolver.Items?.map(x => !x ? null : <li key={Math.random()}>{x.message}</li>)}</ul>
		</div>
	)
}
