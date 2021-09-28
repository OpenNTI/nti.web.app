import React from 'react';

import { scoped } from '@nti/lib-locale';
import { Typography } from '@nti/web-core';
import { isFlag } from '@nti/web-client';

import SearchInfo from '../../../common/SearchInfo';
import Export from '../table/controls/Export';

import { CourseAdminsStore } from './Store';

const t = scoped(
	'nti-web-site-admin.components.users.list.course-admins.Header',
	{
		header: 'Course Administrators',
	}
);

const Header = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 20px 30px 10px;
	gap: 0.5rem;

	& > * {
		white-space: nowrap;
	}
`;

const Controls = styled.div`
	flex: 1 1 auto;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
	gap: 0.5rem;
`;

export const CourseAdminsHeaderPlaceholder = () => (
	<Header>
		<Typography type="header-one-alt">{t('header')}</Typography>
	</Header>
);

export const CourseAdminsHeader = () => {
	const {
		selection,
		batchParams,
		link,
		searchTerm,
	} = CourseAdminsStore.useProperties();

	return (
		<>
			<Header>
				<Typography type="header-one-alt">{t('header')}</Typography>
				<Controls>
					{isFlag('export-users') && (
						<Export
							selectedUsers={selection}
							params={batchParams}
							link={link}
						/>
					)}
				</Controls>
			</Header>
			<SearchInfo searchTerm={searchTerm} />
		</>
	);
};
