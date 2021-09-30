import React from 'react';

import { useLink } from '@nti/web-core';
import { List } from '@nti/web-commons';

import { DeliveryAttemptListItem } from './DeliveryAttemptListItem';

const Item = styled('li')`
	box-shadow: 0 1px 0 var(--color-outline-light);
`

export function DeliveryAttemptHistory({item}) {
	const {Items: items} = useLink(item, 'delivery_history');

	return (
		<List.Unadorned>
			{items
				.map(x => (
					<Item key={x.getID()}><DeliveryAttemptListItem item={x} /></Item>
				))}
		</List.Unadorned>
	)
}

// import { Table, useLink } from '@nti/web-core';
// import { Router } from '@nti/web-routing';
// import { Icons } from '@nti/web-commons';

// import { propertyColumn, CreatedTime } from './columns';
// import { Status } from './Status';

// const columns = [
// 	Table.asBasicColumn(CreatedTime, 'Date'),
// 	Table.asBasicColumn(Status, 'Status'),
// 	propertyColumn('message', 'Message'),
// 	Table.asBasicColumn(() => <Icons.Chevron.Right />),
// ];

// const Tbl = styled(Table)`
// 	font-size: var(--font-size-200, 0.875rem);

// 	td {
// 		padding: var(--padding-xs) 0;
// 	}
// `

// function AttemptHistoryTable({item}) {
// 	const {Items: items} = useLink(item, 'delivery_history');
// 	const router = Router.useRouter();
// 	const onRowClick = (item, event) => {
// 		router.routeTo.object(item);
// 	}
// 	<Tbl onRowClick={onRowClick} columns={columns} items={items} />
// }
