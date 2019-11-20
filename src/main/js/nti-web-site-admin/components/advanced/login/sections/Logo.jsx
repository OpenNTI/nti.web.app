import React from 'react';
import {scoped} from '@nti/lib-locale';
import {Theme} from '@nti/web-commons';

import {Property, Text, AssetPreview, AssetInput} from '../commons';

const t = scoped('nti-web-app.admin.login.sections.Logo', {
	title: 'Logo',
	description: 'Your logo will appear above the username and password fields.',
	recommendedSize: '530 x 150px'
});

export default function Logo () {
	const logo = Theme.useThemeProperty('assets.login_logo');

	return (
		<Property>
			<Property.Description>
				<Text.Title>{t('title')}</Text.Title>
				<Text.Description>{t('description')}</Text.Description>
				<AssetInput asset={logo} name="login_logo" />
			</Property.Description>
			<Property.Preview>
				<AssetPreview property={logo} recommendedSize={t('recommendedSize')}/>
			</Property.Preview>
		</Property>
	);
} 