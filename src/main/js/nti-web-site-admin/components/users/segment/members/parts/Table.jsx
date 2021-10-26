import { Table, TablePlaceholder, ErrorMessage } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';

import { NameColumn } from '../../../list/shared-columns/Name';
import { JoinDateColumn } from '../../../list/shared-columns/JoinDate';
import { LastSeenColumn } from '../../../list/shared-columns/LastSeen';
import { MembersStore } from '../Store';

const Columns = [NameColumn, JoinDateColumn, LastSeenColumn];

const TableClassName = css`
	& td:first-of-type,
	& th:first-of-type {
		padding: 10px 0.25rem 10px 16px;
	}
`;

const ConnectedTable = () => {
	const { items, sortOn, sortOrder, setSort } = MembersStore.useProperties();

	return (
		<Table
			ruled
			className={TableClassName}
			columns={Columns}
			items={items}
			sortOn={sortOn}
			sortDirection={sortOrder}
			onChangeSort={setSort}
		/>
	);
};

export const SegmentMembersTablePlaceholder = () => (
	<TablePlaceholder className={TableClassName} rows={10} columns={Columns} />
);

export const SegmentMembersTable = () => (
	<DataContext
		fallback={<SegmentMembersTablePlaceholder />}
		error={<ErrorMessage as="div" type="body" center pv="md" />}
	>
		<ConnectedTable />
	</DataContext>
);
