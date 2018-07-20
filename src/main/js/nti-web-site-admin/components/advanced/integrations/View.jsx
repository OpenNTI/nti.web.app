import React from 'react';
// import {List} from '@nti/web-integrations';
import {EmptyState} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import Card from '../../common/Card';

const t = scoped('web-site-admin.components.advanced.integrations.View', {
	emptyHeader: 'There are no integrations'
});

const List = EmptyState;

export default function SiteAdminAdvancedIntegrations () {
	return (
		<Card>
			<List header={t('emptyHeader')}/>
		</Card>
	);
}
