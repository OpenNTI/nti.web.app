import React, { useEffect } from 'react';

import { ErrorMessage } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';

import { CourseAdminsStore } from './Store';
import { CourseAdminsHeader, CourseAdminsHeaderPlaceholder } from './Header';
import { CourseAdminsTable, CourseAdminsTablePlaceholder } from './Table';

const Fallback = () => (
	<>
		<CourseAdminsHeaderPlaceholder />
		<CourseAdminsTablePlaceholder />
	</>
);

export function CourseAdmins({ className, searchTerm }) {
	const store = CourseAdminsStore.useStore();

	useEffect(() => store.setSearchTerm(searchTerm), [searchTerm]);

	return (
		<div className={className}>
			<DataContext
				store={store}
				fallback={<Fallback />}
				error={
					<ErrorMessage as="div" type="subhead-one" center pv="lg" />
				}
			>
				<CourseAdminsHeader />
				<CourseAdminsTable />
			</DataContext>
		</div>
	);
}
