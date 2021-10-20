import { Table, TablePlaceholder, ErrorMessage } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';

import { JoinDate } from './columns/JoinDate';
import { LastSeen } from './columns/LastSeen';
import { Name } from './columns/Name';
import { Select } from './columns/Select';
import { CourseAdminsStore } from './Store';

const Columns = [Select, Name, JoinDate, LastSeen];

const ConnectedTable = () => {
	const { items, sortOn, sortOrder, setSort } =
		CourseAdminsStore.useProperties();

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

export const CourseAdminsTablePlaceholder = () => (
	<TablePlaceholder rows={25} columns={Columns} />
);

export const CourseAdminsTable = () => (
	<DataContext
		fallback={<CourseAdminsTablePlaceholder />}
		error={<ErrorMessage as="div" type="body" center pv="md" />}
	>
		<ConnectedTable />
	</DataContext>
);
