import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import {BRAND_COLOR, THEME} from '../../constants';

import BrandColor from './BrandColor';
import ThemeToggle from './theme-toggle';
import styles from './Editor.css';

const cx = classnames.bind(styles);

const BG_PATH = 'library.background';

export default function Editor ({onChange}) {
	const background = Theme.useThemeProperty(BG_PATH);
	const change = what => value => onChange(what, value);
	const lightMode = background === 'light';
	return (
		<div className={cx('editor-root')}>
			<ThemeToggle onChange={value => change(`${THEME}.${BG_PATH}`)(value ? 'light' : 'dark')} checked={lightMode} />
			<BrandColor onChange={color => change(BRAND_COLOR)(color.hex.toString())} />
		</div>
	);
}

Editor.propTypes = {
	onChange: PropTypes.func
};
