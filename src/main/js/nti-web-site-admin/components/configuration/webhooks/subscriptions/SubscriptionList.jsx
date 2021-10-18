import { Table, Text } from '@nti/web-core';
import { EmptyState } from '@nti/web-commons';
import { encodeForURI } from '@nti/lib-ntiids';

import t from '../strings';
import { Store } from '../Store';
import { SUBSCRIPTION_COLUMNS } from '../parts/columns';
import { useHistoryPush } from '../hooks';

import { Pager } from './Pager';

export function SubscriptionList(props) {
	const { items: subscriptions } = Store.useProperties();
	const push = useHistoryPush();

	const empty = !subscriptions?.length;

	return (
		<>
			<Text as="h1">{t('title')}</Text>
			{empty ? (
				<EmptyState
					header="No subscriptions yet"
					subHeader="Connect Zapier, and items will populate here."
				/>
			) : (
				<>
					<Table
						ruled
						items={subscriptions}
						columns={SUBSCRIPTION_COLUMNS}
						onRowClick={item => push(encodeForURI(item.getID()))}
					/>
					<Pager />
				</>
			)}
		</>
	);
}
