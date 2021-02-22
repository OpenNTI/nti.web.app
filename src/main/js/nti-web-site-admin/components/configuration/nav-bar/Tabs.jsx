import React from 'react';
import { scoped } from '@nti/lib-locale';
import { LinkTo } from '@nti/web-routing';
import { Text } from '@nti/web-commons';

import Tabs from '../../common/Tabs';

const DEFAULT_TEXT = {
	header: 'Configuration',
	sync: 'Sync',
	transcripts: 'Certificates, Transcripts, <br />and Course Credit',
	integrations: 'Integrations',
	branding: 'Site Branding',
	login: 'Sign In Branding',
};

const t = scoped('site-admin.advanced.nav-bar.Tabs', DEFAULT_TEXT);

export default function SiteAdminAdvancedTabs() {
	return (
		<Tabs header={t('header')}>
			<LinkTo.Path to="./" exact activeClassName="active">
				<Text.Base localized>{t('branding')}</Text.Base>
			</LinkTo.Path>
			<LinkTo.Path to="./login" exact activeClassName="active">
				<Text.Base localized>{t('login')}</Text.Base>
			</LinkTo.Path>
			<LinkTo.Path to="./transcripts" exact activeClassName="active">
				<Text.Base localized>{t('transcripts')}</Text.Base>
			</LinkTo.Path>
			<LinkTo.Path to="./integrations" activeClassName="active">
				<Text.Base localized>{t('integrations')}</Text.Base>
			</LinkTo.Path>
		</Tabs>
	);
}
