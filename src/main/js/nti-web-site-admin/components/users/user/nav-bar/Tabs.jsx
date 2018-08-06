import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line

import {getString} from 'legacy/util/Localization';

import Tabs from '../../../common/Tabs';

const DEFAULT_TEXT = {
	transcript: 'Transcript',
	courses: getString('NextThought.view.library.View.course'),
	books: 'Books',
	reports: 'Reports',
	overview: 'Overview'
};

const t = scoped('nti-site-admin.users.user.nav-bar.Tabs', DEFAULT_TEXT);

SiteAdminUserTabs.propTypes = {
	user: PropTypes.object.isRequired,
	hasBooks: PropTypes.bool,
	hasCourses: PropTypes.bool
};

export default function SiteAdminUserTabs ({user, hasBooks, hasCourses}) {
	return (
		<Tabs>
			<LinkTo.Path to="./" activeClassName="active" exact>{t('overview')}</LinkTo.Path>
			{hasBooks && (<LinkTo.Path to="./books" activeClassName="active">{t('books')}</LinkTo.Path>)}
			{hasCourses && (<LinkTo.Path to="./courses" activeClassName="active">{t('courses')}</LinkTo.Path>)}
			{user.hasLink('transcript') && (<LinkTo.Path to="./transcript" activeClassName="active">{t('transcript')}</LinkTo.Path>)}
			<LinkTo.Path to="./reports" activeClassName="active">{t('reports')}</LinkTo.Path>
		</Tabs>
	);
}
