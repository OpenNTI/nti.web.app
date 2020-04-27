import React from 'react';
import {scoped} from '@nti/lib-locale';
import {Theme} from '@nti/web-commons';

import {Property, Text, TextInput} from '../../../login/commons';
import Store from '../Store';


const t = scoped('web-site-admin.components.advanced.transcripts.certificate-styling.sections.Label', {
	title: 'Certificate Label'
});

export default function CertificateStylingLabel () {
	const label = Theme.useThemeProperty('certificates.label');
	const {setBrandProp} = Store.useMonitor(['setBrandProp']);

	return (
		<Property>
			<Property.Description>
				<Text.Title>{t('title')}</Text.Title>
			</Property.Description>
			<Property.Preview>
				<TextInput value={label || ''} name="certificate_completion_label" type="disclaimer" maxLength={30} setBrandProp={setBrandProp} />
			</Property.Preview>
		</Property>
	);
}