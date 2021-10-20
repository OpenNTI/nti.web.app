import { Table, TablePlaceholder, ErrorMessage } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';

import { InvitationsStore } from './Store';
import { Name } from './columns/Name';
import { Date } from './columns/Date';
import { Select } from './columns/Select';
import { Controls } from './columns/Controls';

const Columns = [Select, Name, Date, Controls];

const ConnectedTable = () => {
	const { items, sortOn, sortOrder, setSort } =
		InvitationsStore.useProperties();

	return (
		<Table
			ruled
			columns={Columns}
			items={items}
			sortOn={sortOn}
			sortDirection={sortOrder}
			onChangeSort={setSort}
		/>
	);
};

export const InvitationsTablePlaceholder = () => {
	return <TablePlaceholder rows={25} columns={Columns} />;
};

export function InvitationsTable() {
	return (
		<DataContext
			fallback={<InvitationsTablePlaceholder />}
			error={<ErrorMessage as="div" type="body" center pv="md" />}
		>
			<ConnectedTable />
		</DataContext>
	);
}
