import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import {libraryTheme} from './prop-types';
import BrandColor from './BrandColor';
import ThemeToggle from './theme-toggle';
import styles from './Editor.css';

const cx = classnames.bind(styles);

export default function Editor ({onChange, onColorChange}) {
	const background = Theme.useThemeProperty('library.navigation.background');

	const change = v => onColorChange(v.hex.toString());

	const onThemeChange = v => {
		onChange({
			background: v ? 'light' : 'dark'
		});
	};

	const lightMode = background === 'light';

	return (
		<div className={cx('editor-root')}>
			<ThemeToggle onChange={onThemeChange} checked={lightMode}/>
			<BrandColor onChange={change} />
		</div>
	);
}

Editor.propTypes = {
	...libraryTheme,
	onChange: PropTypes.func
};
