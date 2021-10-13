
import { scoped } from '@nti/lib-locale';
import { LinkTo } from '@nti/web-routing';
import { Text } from '@nti/web-commons';
import { useService } from '@nti/web-core';

import Tabs from '../../common/Tabs';
import { SubscriptionsStore } from '../webhooks/SubscriptionsStore';

const t = scoped('site-admin.advanced.nav-bar.Tabs', {
	header: 'Configuration',
	sync: 'Sync',
	transcripts: 'Certificates, Transcripts, <br />and Course Credit',
	integrations: 'Integrations',
	branding: 'Site Branding',
	login: 'Sign In Branding',
	catalog: 'Catalog',
	webhooks: 'Webhooks',
});
const T = Text.Translator(t);

const Tab = ({ localeKey, ...props }) => (
	<LinkTo.Path {...props} activeClassName="active">
		<T {...{ localeKey }} />
	</LinkTo.Path>
);

export default function SiteAdminAdvancedTabs() {
	const service = useService();

	return (
		<Tabs header={t('header')}>
			<Tab to="./" localeKey="branding" exact />
			<Tab to="./login" localeKey="login" exact />
			<Tab to="./transcripts" localeKey="transcripts" exact />
			<Tab to="./integrations" localeKey="integrations" />
			<Tab to="./catalog" localeKey="catalog" />
			{SubscriptionsStore.hasWebhooks(service) && (
				<Tab to="./webhooks" localeKey="webhooks" />
			)}
		</Tabs>
	);
}
