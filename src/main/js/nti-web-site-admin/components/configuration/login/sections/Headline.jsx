
import { scoped } from '@nti/lib-locale';
import { Theme } from '@nti/web-commons';

import { Property, Text, TextInput } from '../commons';

const t = scoped('nti-web-app.admin.login.sections.Headline', {
	title: 'Headline',
	description: 'Welcome users with a short greeting.',
});

export default function Headline() {
	const title = Theme.useThemeProperty('login.title');

	return (
		<Property>
			<Property.Description>
				<Text.Title>{t('title')}</Text.Title>
				<Text.Description>{t('description')}</Text.Description>
			</Property.Description>
			<Property.Preview>
				<TextInput
					value={title}
					name="theme.login.title"
					type="headline"
					maxLength={30}
				/>
			</Property.Preview>
		</Property>
	);
}
