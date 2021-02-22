import React from 'react';
import { scoped } from '@nti/lib-locale';
import { Theme } from '@nti/web-commons';

import { Property, Text, TextInput } from '../commons';

const t = scoped('nti-web-app.admin.login.sections.Description', {
	title: 'Description',
	description: 'Encourage users or frame your offering.',
});

export default function Description() {
	const description = Theme.useThemeProperty('login.description');

	return (
		<Property>
			<Property.Description>
				<Text.Title>{t('title')}</Text.Title>
				<Text.Description>{t('description')}</Text.Description>
			</Property.Description>
			<Property.Preview>
				<TextInput
					value={description}
					name="theme.login.description"
					type="description"
					maxLength={140}
				/>
			</Property.Preview>
		</Property>
	);
}
