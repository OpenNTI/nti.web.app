import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import {BRAND_COLOR, THEME} from '../../constants';

import BrandColor from './BrandColor';
import ThemeToggle from './theme-toggle';
import InputContainer from './InputContainer';
import styles from './Editor.css';

const cx = classnames.bind(styles);
const t = scoped('nti-web-site-admin.components.advanced.branding.sections.library.Editor', {
	libraryTheme: 'Library Theme',
	brandingColor: 'Branding Color',
	searchBar: 'Search Bar',
	navIcons: 'Nav Icons'
});

const BG_PATH = 'library.background';

export default function Editor ({onChange}) {
	const background = Theme.useThemeProperty(BG_PATH);
	const change = what => value => onChange(what, value);
	const lightMode = background === 'light';
	return (
		<div className={cx('editor-bar')}>
			<div className={cx('editor-root')}>
				<InputContainer label={t('libraryTheme')} className={cx('input')}>
					<ThemeToggle onChange={value => change(`${THEME}.${BG_PATH}`)(value ? 'light' : 'dark')} checked={lightMode} />
				</InputContainer>
				<InputContainer label={t('brandingColor')} className={cx('input')}>
					<BrandColor onChange={color => change(BRAND_COLOR)(color.hex.toString())} />
				</InputContainer>
			</div>
		</div>
	);
}

Editor.propTypes = {
	onChange: PropTypes.func
};
