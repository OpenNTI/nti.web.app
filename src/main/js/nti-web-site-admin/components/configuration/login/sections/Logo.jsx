import React from 'react';

import { scoped } from '@nti/lib-locale';

import { Property, Text, AssetPreview, AssetInput } from '../commons';

const t = scoped('nti-web-app.admin.login.sections.Logo', {
	title: 'Logo',
	description:
		'Your logo will appear above the username and password fields.',
	recommendedSize: 'Assets over 500px wide or 100px tall will be scaled.',
	notSetLabel: 'Add a Logo',
	notSetHeader: 'No Logo Set',
});

const hideFlag = 'login.noLogo';

export default function Logo() {
	return (
		<Property>
			<Property.Description>
				<Text.Title>{t('title')}</Text.Title>
				<Text.Description>{t('description')}</Text.Description>
				<AssetInput
					name="login_logo"
					hideFlag={hideFlag}
					notSet={t('notSetLabel')}
				/>
			</Property.Description>
			<Property.Preview>
				<AssetPreview
					name="login_logo"
					recommendedSize={t('recommendedSize')}
					hideFlag={hideFlag}
					notSetLabel={t('notSetLabel')}
					notSetHeader={t('notSetHeader')}
				/>
			</Property.Preview>
		</Property>
	);
}
