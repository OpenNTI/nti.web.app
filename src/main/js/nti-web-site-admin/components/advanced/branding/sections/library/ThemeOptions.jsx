import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Select} from '@nti/web-commons';

const t = scoped('nti-web-site-admin.components.advanced.branding.sections.library.ThemeOptions', {
	auto: 'Auto',
	dark: 'Dark',
	light: 'Light'
});

const options = [
	{value: null, label: t('auto')},
	{value: 'dark', label: t('dark')},
	{value: 'light', label: t('light')}	
];

ThemeOptions.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func
};
export default function ThemeOptions ({value, onChange}) {
	return (
		<Select value={value} onChange={onChange}>
			{options.map((o, i) => {
				return (
					<option key={i} value={o.value}>{o.label}</option>
				);
			})}
		</Select>
	);
}
