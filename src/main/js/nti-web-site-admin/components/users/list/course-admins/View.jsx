import React, { useEffect } from 'react';

import { scoped } from '@nti/lib-locale';
import { ErrorMessage } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';
import { WithSearch } from '@nti/web-search';

import { CourseAdminsStore } from './Store';
import { CourseAdminsHeader, CourseAdminsHeaderPlaceholder } from './Header';
import { CourseAdminsFooter } from './Footer';
import { CourseAdminsTable, CourseAdminsTablePlaceholder } from './Table';

const t = scoped(
	'nti-web-site-admin.components.users.list.course-admins.View',
	{
		search: 'Course Admins',
	}
);

const Fallback = () => (
	<>
		<CourseAdminsHeaderPlaceholder />
		<CourseAdminsTablePlaceholder />
	</>
);

function CourseAdminsImpl({ className, searchTerm }) {
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
				<CourseAdminsFooter />
			</DataContext>
		</div>
	);
}

export const CourseAdmins = WithSearch(CourseAdminsImpl, {
	label: t('search'),
});
