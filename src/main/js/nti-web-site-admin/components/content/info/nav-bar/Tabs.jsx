import React from 'react';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';

import Tabs from '../../../common/Tabs';

const DEFAULT_TEXT = {
	overview: 'Overview',
	roster: 'Roster',
	reports: 'Reports'
};
const t = scoped('nti-site-admin.courses.info.nav-bar.Tabs', DEFAULT_TEXT);

export default function SiteAdminCourseTabs () {
	return (
		<Tabs>
			<LinkTo.Path to="./" activeClassName="active" exact>{t('overview')}</LinkTo.Path>
			<LinkTo.Path to="./roster" activeClassName="active">{t('roster')}</LinkTo.Path>
			<LinkTo.Path to="./reports" activeClassName="active">{t('reports')}</LinkTo.Path>
		</Tabs>
	);
}
