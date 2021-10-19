import { useEffect } from 'react';

import { scoped } from '@nti/lib-locale';
import { EmptyState, List, Loading } from '@nti/web-commons';
import { LinkTo } from '@nti/web-routing';
import { EnrollmentListItem } from '@nti/web-course';

import ErrorMessage from '../../../common/ErrorMessage';
import Card from '../../../common/Card';

import Store from './Store';

const t = scoped('nti-site-admin.users.user.courses-administered.View', {
	error: 'Unable to load courses.',
	noCourses: 'This user is not administering any courses',
});

function SiteAdminUserAdministeredCourses({ user }) {
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
				margin-top: 54px;
				min-height: 200px;
				position: relative;
			`}
		>
			{loading ? (
				<Loading.Mask />
			) : (
				<>
					<Items {...{ user, onEnrollmentChange }} />
				</>
			)}
			{error && <ErrorMessage>{t('error')}</ErrorMessage>}
		</div>
	);
}

export default Store.compose(SiteAdminUserAdministeredCourses);

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
							context="site-admin.users.user-administered-courses.list"
						>
							<EnrollmentListItem enrollment={item} />
						</LinkTo.Object>
					</ListItem>
				))}
			</List.Unadorned>
		</Card>
	);
}
