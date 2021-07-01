import React from 'react';

import { Text, StandardUI } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import { AnonymousCatalog } from './AnonymousCatalog';

const { Box } = StandardUI;

const t = scoped('nti-web-app.admin.config.Catalog', {
	title: 'Catalog',
});

export function Catalog(props) {
	return (
		<Box p="lg" sh="sm">
			<Text.Base as="h1">{t('title')}</Text.Base>
			<AnonymousCatalog />
		</Box>
	);
}
