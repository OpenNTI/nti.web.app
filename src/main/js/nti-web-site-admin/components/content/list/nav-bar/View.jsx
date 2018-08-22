import React from 'react';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';

import Card from '../../../common/Card';
import Tabs from '../../../common/Tabs';

const DEFAULT_TEXT = {
	content: 'Content',
	courses: 'Courses',
	books: 'Books'
};

const t = scoped('nti-site-admin.content.list.navbar.View', DEFAULT_TEXT);

export default class ContentListNavBar extends React.Component {
	render () {
		return (
			<Card className="site-admin-content-list-nav-bar">
				<div className="header">{t('content')}</div>
				<Tabs>
					<LinkTo.Path to="./" activeClassName="active" exact>{t('courses')}</LinkTo.Path>
					<LinkTo.Path to="./books" activeClassName="active">{t('books')}</LinkTo.Path>
				</Tabs>
			</Card>
		);
	}
}
