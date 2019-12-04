import React from 'react';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line

import Tabs from '../../common/Tabs';

const DEFAULT_TEXT = {
	header: 'Configuration',
	sync: 'Sync',
	transcripts: 'Transcripts & Course Credit',
	integrations: 'Webinars',
	branding: 'Site Branding',
	login: 'Login Branding'
};

const t = scoped('site-admin.advanced.nav-bar.Tabs', DEFAULT_TEXT);

export default function SiteAdminAdvancedTabs () {
	return (
		<Tabs header={t('header')}>
			<LinkTo.Path to="./" exact activeClassName="active">{t('branding')}</LinkTo.Path>
			<LinkTo.Path to="./login" exact activeClassName="active">{t('login')}</LinkTo.Path>
			<LinkTo.Path to="./transcripts" exact activeClassName="active">{t('transcripts')}</LinkTo.Path>
			<LinkTo.Path to="./integrations" activeClassName="active">{t('integrations')}</LinkTo.Path>
		</Tabs>
	);
}
