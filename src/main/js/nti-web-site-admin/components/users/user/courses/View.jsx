import { useEffect } from 'react';

import { scoped } from '@nti/lib-locale';
import { Button } from '@nti/web-core';
import { EmptyState, List, Loading } from '@nti/web-commons';
import { LinkTo } from '@nti/web-routing';
import { EnrollmentListItem, Enrollment } from '@nti/web-course';

import ErrorMessage from '../../../common/ErrorMessage';
import Card from '../../../common/Card';

import Store from './Store';

const t = scoped('nti-site-admin.users.user.courses.View', {
	error: 'Unable to load courses.',
	noCourses: 'This user is not enrolled in any courses',
	manage: 'Manage Courses',
});

function SiteAdminUserCourses({ user }) {
	const { loading, error, load, unload } = Store.useValue();

	useEffect(() => {
		load(user);
		return () => {
			unload(user);
		};
	}, [user]);

	const onEnrollmentChange = () => {
		load(user);
	};

	return (
		<div
			css={css`
				min-height: 200px;
				position: relative;
			`}
		>
			{loading ? (
				<Loading.Mask />
			) : (
				<>
					<Controls {...{ user, onEnrollmentChange }} />
					<Items {...{ user, onEnrollmentChange }} />
				</>
			)}
			{error && <ErrorMessage>{t('error')}</ErrorMessage>}
		</div>
	);
}

export default Store.compose(SiteAdminUserCourses);

function Controls({ user, onEnrollmentChange }) {
	if (!user.hasLink('EnrollUser')) {
		return null;
	}

	return (
		<div
			css={css`
				display: flex;
				flex-direction: row;
				justify-content: flex-end;
				margin-bottom: 1rem;
			`}
		>
			<Enrollment.Admin.Prompt.Trigger
				user={user}
				onChange={onEnrollmentChange}
			>
				<Button rounded>{t('manage')}</Button>
			</Enrollment.Admin.Prompt.Trigger>
		</div>
	);
}

const ListItem = styled.li`
	&:not(:last-of-type) {
		box-shadow: 0 1px 0 0 var(--border-grey-light);
	}

	a {
		text-decoration: none;
	}
`;

function Items({ onEnrollmentChange }) {
	const { items } = Store.useValue();

	if (!items?.length) {
		return <EmptyState>{t('noCourses')}</EmptyState>;
	}

	return (
		<Card>
			<List.Unadorned>
				{items.map((item, index) => (
					<ListItem key={index}>
						<LinkTo.Object
							object={item}
							context="site-admin.users.user-transcript.list"
						>
							<EnrollmentListItem
								enrollment={item}
								onChange={onEnrollmentChange}
							/>
						</LinkTo.Object>
					</ListItem>
				))}
			</List.Unadorned>
		</Card>
	);
}
