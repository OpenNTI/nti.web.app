
import { SimpleTableHeader } from '@nti/web-core';

import { InvitationsStore } from '../Store';

export const VerticallyCentered = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
`;

export const Centered = styled.div`
	display: flex;
	align-items: center;
	justify-content: center; ;
`;

export const TableHeader = props => {
	const { sortOn, sortOrder, setSort } = InvitationsStore.useProperties();

	return (
		<SimpleTableHeader
			{...props}
			sortOn={sortOn}
			sortDirection={sortOrder}
			onChangeSort={setSort}
		/>
	);
};
