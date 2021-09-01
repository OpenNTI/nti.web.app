import React from 'react';

import { Router } from '@nti/web-routing';
import { Table, DateTime } from '@nti/web-core';

import {SubscriptionsStore as Store} from './SubscriptionsStore';

const propertyColumn = (propName, title = propName) => Table.asBasicColumn(({item}) => item?.[propName] ?? null, title);

const CreatedTime = ({item}) => {
	const createdTime = item?.getCreatedTime?.();
	return createdTime ? <DateTime date={item.getCreatedTime()} /> : null
}


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
