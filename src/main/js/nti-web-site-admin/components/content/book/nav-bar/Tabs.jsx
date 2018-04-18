import React from 'react';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';

import Tabs from '../../../common/Tabs';

const DEFAULT_TEXT = {
	overview: 'Overview',
	reports: 'Reports'
};
const t = scoped('nti-site-admin.courses.book.nav-bar.Tabs', DEFAULT_TEXT);

export default function SiteAdminBookTabs () {
	return (
		<Tabs>
			<LinkTo.Path to="./" activeClassName="active" exact>{t('overview')}</LinkTo.Path>
		</Tabs>
	);
}
