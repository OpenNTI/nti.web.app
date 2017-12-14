import React from 'react';
import {scoped} from 'nti-lib-locale';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line

const DEFAULT_TEXT = {
	progress: 'Progress',
	reports: 'Reports',
	overview: 'Overview'
};

const t = scoped('nti-site-admin.users.user.nav-bar.Tabs', DEFAULT_TEXT);

export default function SiteAdminUserEnrollmentTabs () {
	return (
		<ul className="site-admin-user-tabs">
			<li>
				<LinkTo.Path to="./" activeClassName="active" exact>{t('overview')}</LinkTo.Path>
			</li>
			<li>
				<LinkTo.Path to="./reports" activeClassName="active">{t('reports')}</LinkTo.Path>
			</li>
			<li>
				<LinkTo.Path to="./progress" activeClassName="active">{t('progress')}</LinkTo.Path>
			</li>
		</ul>
	);
}
