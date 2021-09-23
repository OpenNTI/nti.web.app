import React from 'react';

import { scoped } from '@nti/lib-locale';
import { Placeholder, Typography } from '@nti/web-core';

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

export const CourseAdminsHeaderPlaceholder = () => (
	<Header>
		<Placeholder.Text type="header-one-alt" text={t('header')} />
	</Header>
);

export const CourseAdminsHeader = () => {
	return (
		<Header>
			<Typography type="header-one-alt">{t('header')}</Typography>
		</Header>
	);
};
