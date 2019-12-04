import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Input} from '@nti/web-commons';

import Sun from './SunIcon';
import Moon from './MoonIcon';
import style from './Toggle.css';

const cx = classnames.bind(style);

const classes = {
	root: cx('root'),
	toggler: cx('toggler'),
	label: cx('label'),
	button: cx('button'),
	icon: cx('icon'),
	icons: cx('icons'),
	iconOff: cx('icon-off'),
	iconOn: cx('icon-on')
};

export default function ToggleInput ({onChange, checked = false}) {
	return (
		<Input.Toggle
			classes={classes}
			iconOff={Moon}
			iconOn={Sun}
			hideLabel
			className={cx('theme-toggle', { off: !checked, on: checked})}
			value={checked}
			onChange={onChange}
		/>
	);
}

ToggleInput.propTypes = {
	onChange: PropTypes.func.isRequired,
	checked: PropTypes.bool
};
