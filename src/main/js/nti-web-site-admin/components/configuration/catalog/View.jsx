import React from 'react';

import { Text } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import Card from '../../common/Card';

const t = scoped('nti-web-app.admin.config.Catalog', {
	title: 'Catalog',
	anonymousAccess: 'Make catalog viewable by unauthenticated users',
});

export function Catalog(props) {
	return (
		<Card>
			<Text.Base as="h1">{t('title')}</Text.Base>
		</Card>
	);
}
