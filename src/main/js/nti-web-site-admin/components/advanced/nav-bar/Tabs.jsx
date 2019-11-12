import React from 'react';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line
import {List} from '@nti/web-commons';

const DEFAULT_TEXT = {
	sync: 'Sync',
	transcripts: 'Transcripts',
	integrations: 'Webinars',
	branding: 'Brand & Style'
};

const t = scoped('site-admin.advanced.nav-bar.Tabs', DEFAULT_TEXT);

export default function SiteAdminAdvancedTabs () {
	return (
		<List.Unadorned className="site-admin-advanced-tabs">
			<li>
				<LinkTo.Path to="./" exact activeClassName="active">{t('transcripts')}</LinkTo.Path>
				<LinkTo.Path to="./integrations" activeClassName="active">{t('integrations')}</LinkTo.Path>
				{global.Service && global.Service.getWorkspaceLink('SiteAdmin', 'SiteBrand') ?
					(<LinkTo.Path to="./branding" exact activeClassName="active">{t('branding')}</LinkTo.Path>) :
					null
				}
			</li>
		</List.Unadorned>
	);
}
