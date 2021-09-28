import React from 'react';

import { Text, StandardUI } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';
import { DataContext } from '@nti/web-core/data';

import { SubscriptionsStore as Store } from './SubscriptionsStore';

const { Box } = StandardUI;

const t = scoped('nti-web-app.admin.config.Webhooks', {
	title: 'Webhook Subscriptions',
});

export const Frame = ({children}) => (
	<Box p="lg" sh="sm">
		<Text.Base as="h1">{t('title')}</Text.Base>
		<DataContext store={Store.useStore()} fallback={<div />}>
			{children}
		</DataContext>
	</Box>
)
