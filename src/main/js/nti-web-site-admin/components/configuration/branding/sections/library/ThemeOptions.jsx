import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { scoped } from '@nti/lib-locale';
import { Select } from '@nti/web-commons';

import Styles from './ThemeOptions.css';

const cx = classnames.bind(Styles);
const t = scoped(
	'nti-web-site-admin.components.advanced.branding.sections.library.ThemeOptions',
	{
		auto: 'Auto',
		dark: 'Dark',
		light: 'Light',
	}
);

const auto = 'auto';

const options = [
	{ value: auto, label: t('auto') },
	{ value: 'dark', label: t('dark') },
	{ value: 'light', label: t('light') },
];

ThemeOptions.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
};
export default function ThemeOptions({ value, onChange }) {
	const change = e => {
		if (!onChange) {
			return;
		}

		if (e.target.value === auto) {
			onChange(null);
		} else {
			onChange(e.target.value);
		}
	};

	return (
		<div className={cx('theme-options')}>
			<Select value={value || auto} onChange={change}>
				{options.map((o, i) => {
					return (
						<option key={i} value={o.value}>
							{o.label}
						</option>
					);
				})}
			</Select>
		</div>
	);
}
