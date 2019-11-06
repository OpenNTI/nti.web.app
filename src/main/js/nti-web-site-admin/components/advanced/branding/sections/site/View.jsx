import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Input, Theme} from '@nti/web-commons';

import {BRAND_NAME} from '../../constants';
import Section from '../Section';


const t = scoped('nti-web-app.admin.branding.Site', {
	title: 'Site Details',
});

export default function Site ({onChange}) {
	const brandName = Theme.useThemeProperty('brandName'); // 'brandName' in theme, 'brand_name' in SiteBrand
	const changeHandler = fieldName => v => onChange(fieldName, v);
	return (
		<Section title={t('title')}>
			<Input.Text value={brandName} onChange={changeHandler(BRAND_NAME)} />
		</Section>
	);
}

Site.propTypes = {
	onChange: PropTypes.func.isRequired,
};
