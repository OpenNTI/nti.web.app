import { Table, TablePlaceholder, ErrorMessage } from '@nti/web-core';

import { Creator } from './columns/Creator';
import { LastModified } from './columns/LastModified';
import { Name } from './columns/Name';
import { EmptyState } from './EmptyState';
import { UserSegmentsStore } from './Store';

const Columns = [Name, LastModified, Creator];

export const UserSegmentsTablePlaceholder = () => (
	<TablePlaceholder rows={25} columns={Columns} />
);

export function UserSegmentsTable() {
	const { load, items, sortOn, sortOrder, setSort } =
		UserSegmentsStore.useProperties();

	if (load.running) {
		return <UserSegmentsTablePlaceholder />;
	}

	if (load.error) {
		return <ErrorMessage error={load.error} type="body" center pv="md" />;
	}

	return (
		<Table
			ruled
			columns={Columns}
			items={items}
			sortOn={sortOn}
			sortDirection={sortOrder}
			onChangeSort={setSort}
			emptyFallback={<EmptyState />}
		/>
	);
}
