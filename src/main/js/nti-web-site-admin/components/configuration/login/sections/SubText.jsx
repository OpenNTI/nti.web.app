import React from 'react';
import { scoped } from '@nti/lib-locale';
import { Theme } from '@nti/web-commons';

import { Property, Text, TextInput } from '../commons';

const t = scoped('nti-web-app.admin.login.sections.Subtext', {
	title: 'Subtext',
	description: 'Small text for any remaining information.',
	optional: 'Optional',
});

export default function Subtext() {
	const disclaimer = Theme.useThemeProperty('login.disclaimer');

	return (
		<Property>
			<Property.Description>
				<Text.Title>
					{t('title')} <Text.Badge>{t('optional')}</Text.Badge>
				</Text.Title>
				<Text.Description>{t('description')}</Text.Description>
			</Property.Description>
			<Property.Preview>
				<TextInput
					value={disclaimer}
					name="theme.login.disclaimer"
					type="disclaimer"
					maxLength={30}
				/>
			</Property.Preview>
		</Property>
	);
}
