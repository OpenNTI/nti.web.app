import { Suspense } from 'react';

import { Text } from '@nti/web-core';
import { scoped } from '@nti/lib-locale';
import { LinkTo } from '@nti/web-routing';

import Card from '../../../common/Card';
import Tabs from '../../../common/Tabs';

const t = scoped('nti-site-admin.content.list.navbar.View', {
	content: 'Content',
	courses: 'Courses',
	books: 'Books',
});

const T = Text.Translator(t);
const Tab = ({ localeKey, ...props }) => (
	<LinkTo.Path {...props} activeClassName="active">
		<T {...{ localeKey }} />
	</LinkTo.Path>
);

export default function ContentListNavBar() {
	return (
		<Suspense fallback={<div />}>
			<Content />
		</Suspense>
	);
}
function Content() {
	return (
		<Card
			className="site-admin-content-list-nav-bar"
			css={css`
				box-shadow: 0 1px 3px 0 rgba(0 0 0 / 24%);
				background-color: white;
				padding-bottom: 20px;
			`}
		>
			<Tabs header={t('content')}>
				<Tab to="./" exact localeKey="courses" />
				<Tab to="./books" localeKey="books" />
			</Tabs>
		</Card>
	);
}
