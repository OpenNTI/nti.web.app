import React from 'react';
import {List} from '@nti/web-integrations';

import Card from '../../common/Card';

export default function SiteAdminAdvancedIntegrations () {
	return (
		<Card>
			<List header={t('emptyHeader')}/>
		</Card>
	);
}
