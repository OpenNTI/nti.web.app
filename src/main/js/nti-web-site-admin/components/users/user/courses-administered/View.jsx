import { scoped } from '@nti/lib-locale';
import { EmptyState, List } from '@nti/web-commons';
import { LinkTo } from '@nti/web-routing';
import { EnrollmentListItem } from '@nti/web-course';
import { DataContext } from '@nti/web-core/data';

import Card from '../../../common/Card';
import ErrorMessage from '../../../common/ErrorMessage';
import { ListItem, PlaceholderCourses } from '../courses/parts';

import { Store } from './Store';
import { Pager } from './Pager';

const t = scoped('nti-site-admin.users.user.courses-administered.View', {
	error: 'Unable to load courses.',
	noCourses: 'This user is not administering any courses',
});

export default function SiteAdminUserAdministeredCourses({ user }) {
	return (
		<div
			css={css`
				margin-top: 54px;
				min-height: 200px;
				position: relative;
			`}
		>
			<DataContext
				store={Store.useStore({ user })}
				fallback={<PlaceholderCourses />}
			>
				<Items />
			</DataContext>
		</div>
	);
}

function Items() {
	const { items, error } = Store.useProperties();

	return (
		<>
			{error ? (
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
									context="site-admin.users.user-administered-courses.list"
								>
									<EnrollmentListItem enrollment={item} />
								</LinkTo.Object>
							</ListItem>
						))}
					</List.Unadorned>
					<Pager />
				</Card>
			)}
		</>
	);
}
