import { Table, DateTime } from '@nti/web-core';

export const propertyColumn = (propName, title = propName) => Table.asBasicColumn(({item}) => item?.[propName] ?? null, title);

export const CreatedTime = ({item}) => {
	const createdTime = item?.getCreatedTime?.();
	return createdTime ? <DateTime date={createdTime} /> : null
}
