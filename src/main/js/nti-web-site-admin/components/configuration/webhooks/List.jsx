import React from 'react';

import { Router } from '@nti/web-routing';
import { Table } from '@nti/web-core';

import { propertyColumn, CreatedTime } from './columns/index';
import { SubscriptionsStore as Store } from './SubscriptionsStore';

const columns = [
	propertyColumn('OwnerId', 'Owner'),
	propertyColumn('Status'),
	Table.asBasicColumn(CreatedTime, 'Created'),
]

export function List (props) {
	const router = Router.useRouter();
	const { subscriptions } = Store.useProperties();
	const onRowClick = (item, event) => {
		router.routeTo.object(item);
	}


	return (
		<Table onRowClick={onRowClick} columns={columns} items={subscriptions} />
	);
}
