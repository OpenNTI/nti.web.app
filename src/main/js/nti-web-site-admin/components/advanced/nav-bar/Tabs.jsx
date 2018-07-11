import React from 'react';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line

const DEFAULT_TEXT = {
	sync: 'Sync',
	transcripts: 'Transcripts',
	integrations: 'Integrations'
};

const t = scoped('site-admin.advanced.nav-bar.Tabs', DEFAULT_TEXT);

export default function SiteAdminAdvancedTabs () {
	return (
		<ul className="site-admin-advanced-tabs">
			<li>
				<LinkTo.Path to="./" exact activeClassName="active">{t('transcripts')}</LinkTo.Path>
				<LinkTo.Path to="./integrations" activeClassName="active">{t('integrations')}</LinkTo.Path>
			</li>
		</ul>
	);
}
