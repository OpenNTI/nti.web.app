import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';
import { useStoreValue } from '@nti/lib-store';
import { LinkTo } from '@nti/web-routing';
import { Text } from '@nti/web-commons';
import { getString } from 'internal/legacy/util/Localization';

import Tabs from '../../../common/Tabs';

const t = scoped('nti-site-admin.users.user.nav-bar.Tabs', {
	transcript: 'Transcript',
	courses: getString('NextThought.view.library.View.course'),
	administered: 'Administered Courses',
	books: 'Books',
	reports: 'Reports',
	overview: 'Overview',
});

const T = Text.Translator(t);
const Tab = ({ localeKey, ...props }) => (
	<LinkTo.Path {...props} activeClassName="active">
		<T {...{ localeKey }} />
	</LinkTo.Path>
);

SiteAdminUserTabs.propTypes = {
	user: PropTypes.object.isRequired,
};

export default function SiteAdminUserTabs({ user }) {
	const { hasBooks, hasCourses } = useStoreValue();
	return (
		<Tabs>
			<Tab to="./" exact localeKey="overview" />
			{hasBooks && <Tab to="./books" localeKey="books" />}
			{hasCourses && <Tab to="./courses" localeKey="courses" />}
			{user.hasLink('CoursesExplicitlyAdministered') && (
				<Tab to="./administered-courses" localeKey="administered" />
			)}
			{user.hasLink('transcript') && (
				<Tab to="./transcript" localeKey="transcript" />
			)}
			<Tab to="./reports" localeKey="reports" />
		</Tabs>
	);
}
