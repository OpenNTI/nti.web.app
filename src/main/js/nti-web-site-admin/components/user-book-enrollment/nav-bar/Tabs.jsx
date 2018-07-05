import React from 'react';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line

const DEFAULT_TEXT = {
	progress: 'Progress',
	reports: 'Reports',
	overview: 'Overview'
};

const t = scoped('nti-site-admin.users.user-book-enrollment.nav-bar.Tabs', DEFAULT_TEXT);

export default function SiteAdminUserBookTabs () {
	return (
		<ul className="site-admin-user-tabs">
			<li>
				<LinkTo.Path to="./" activeClassName="active" exact>{t('overview')}</LinkTo.Path>
			</li>
			<li>
				<LinkTo.Path to="./reports" activeClassName="active">{t('reports')}</LinkTo.Path>
			</li>
		</ul>
	);
}
