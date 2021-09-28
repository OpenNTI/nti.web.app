import React from 'react';

import {useLink} from '@nti/web-core';

import {DeliveryAttemptListItem} from './DeliveryAttemptListItem';

export function History({item}) {
	const {Items: items} = useLink(item, 'delivery_history');

	return (
		<ul>{items.map(x => !x ? null : <li key={x.getID()}><DeliveryAttemptListItem item={x} /></li>)}</ul>
	);
}
