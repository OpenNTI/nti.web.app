import React from 'react';

import { SimpleTableHeader } from '@nti/web-core';

import { InvitationsStore } from '../Store';

export const TableHeader = props => {
	const { sortProperty, sortDirection, setSort } =
		InvitationsStore.useProperties();

	return (
		<SimpleTableHeader
			{...props}
			sortOn={sortProperty}
			sortDirection={sortDirection}
			onChangeSort={setSort}
		/>
	);
};
