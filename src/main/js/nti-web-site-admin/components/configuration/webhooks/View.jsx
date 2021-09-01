import React from 'react';

import { Text, StandardUI } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';
import { Table, DateTime } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';
import { Router, Route } from '@nti/web-routing';

import {SubscriptionsStore as Store} from './SubscriptionsStore';

const { Box } = StandardUI;

const t = scoped('nti-web-app.admin.config.Webhooks', {
	title: 'Webhooks',
});

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

const Frame = ({children}) => (
	<Box p="lg" sh="sm">
		<Text.Base as="h1">{t('title')}</Text.Base>
		{children}
	</Box>
)

function Content (props) {
	const router = Router.useRouter();
	const { subscriptions } = Store.useProperties();
	const onRowClick = (item, event) => {
		router.routeTo.object(item);
	}


	return (
		<Table onRowClick={onRowClick} columns={columns} items={subscriptions} />
	);
}

export function List (props) {
	return (
		<DataContext store={Store.useStore()} fallback={<div />}>
			<Content {...props} />
		</DataContext>
	)
}

export const Webhooks = Router.for(
	[
		Route({
			path: '/:id',
			component: () => <div>detail</div>,
			getRouteFor: (obj, context) => {
				if (obj?.isPersistentSubscription) {
					return obj.getID();
				}
			}
		}),
		Route({
			path: '/',
			component: List,
		}),
	],
	{ frame: Frame }
);
