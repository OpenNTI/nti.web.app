import { Suspense } from 'react';

import { scoped } from '@nti/lib-locale';
import { Button } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';
import { EmptyState, List } from '@nti/web-commons';
import { LinkTo } from '@nti/web-routing';
import { EnrollmentListItem, Enrollment } from '@nti/web-course';

import ErrorMessage from '../../../common/ErrorMessage';
import Card from '../../../common/Card';

import { Store } from './Store';
import { ListItem, Pager, PlaceholderCourses } from './parts';

const t = scoped('nti-site-admin.users.user.courses.View', {
	error: 'Unable to load courses.',
	noCourses: 'This user is not enrolled in any courses',
	manage: 'Manage Courses',
});

export default function SiteAdminUserCourses({ user }) {
	return (
		<div
			css={css`
				min-height: 200px;
				position: relative;
			`}
		>
			<DataContext
				store={Store.useStore({ user })}
				fallback={<Loading user={user} />}
			>
				<>
					<Controls user={user} />
					<Suspense fallback={<PlaceholderCourses />}>
						<Items />
					</Suspense>
				</>
			</DataContext>
		</div>
	);
}

function Loading({ user }) {
	// This is a workaround ... I would prefer to only fallback on the Suspense boundary, but... the DataContext makes assumptions...
	return (
		<>
			<Controls user={user} />
			<PlaceholderCourses />
		</>
	);
}

function Controls({ user }) {
	return (
		<div
			css={css`
				display: flex;
				flex-direction: row;
				justify-content: flex-end;
				margin-top: 1rem;
				min-height: 38px;
			`}
		>
			<Suspense fallback={<div />}>
				<Manage user={user} />
			</Suspense>
		</div>
	);
}

function Manage({ user }) {
	const { onEnrollmentChange } = Store.useProperties();
	return !user?.hasLink('EnrollUser') ? null : (
		<Enrollment.Admin.Prompt.Trigger
			user={user}
			onChange={onEnrollmentChange}
		>
			<Button size="small" rounded pv="sm" ph="md">
				{t('manage')}
			</Button>
		</Enrollment.Admin.Prompt.Trigger>
	);
}

function Items() {
	const { error, items, onEnrollmentChange } = Store.useProperties();

	return error ? (
		<ErrorMessage>{t('error')}</ErrorMessage>
	) : !items?.length ? (
		<EmptyState>{t('noCourses')}</EmptyState>
	) : (
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
			<Pager />
		</Card>
	);
}
