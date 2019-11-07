import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import {BRAND_COLOR, THEME} from '../../constants';

import BrandColor from './BrandColor';
import ThemeToggle from './theme-toggle';
import InputContainer from './InputContainer';
import ThemeOptions from './ThemeOptions';
import styles from './Editor.css';

const cx = classnames.bind(styles);
const t = scoped('nti-web-site-admin.components.advanced.branding.sections.library.Editor', {
	libraryTheme: 'Library Theme',
	brandingColor: 'Branding Color',
	searchBar: 'Search Bar',
	navIcons: 'Nav Icons'
});

const BG_PATH = 'library.background';
const SEARCH_PATH = 'library.navigation.search';
const ICON_PATH = 'library.navigation.icon';

export default function Editor ({onChange}) {
	const background = Theme.useThemeProperty(BG_PATH);
	const lightMode = background === 'light';

	const search = Theme.useThemeProperty(SEARCH_PATH);
	const icon = Theme.useThemeProperty(ICON_PATH);

	const change = what => value => onChange(what, value);
	return (
		<div className={cx('editor-bar')}>
			<div className={cx('editor-root')}>
				<InputContainer label={t('libraryTheme')} className={cx('input')}>
					<ThemeToggle onChange={value => change(`${THEME}.${BG_PATH}`)(value ? 'light' : 'dark')} checked={lightMode} />
				</InputContainer>
				<InputContainer label={t('brandingColor')} className={cx('input')}>
					<BrandColor onChange={color => change(BRAND_COLOR)(color.hex.toString())} />
				</InputContainer>
				<InputContainer label={t('searchBar')} className={cx('input')}>
					<ThemeOptions value={search} onChange={theme => change(`${THEME}.${SEARCH_PATH}`, theme)} />
				</InputContainer>
				<InputContainer label={t('navIcons')} className={cx('input')}>
					<ThemeOptions value={icon} onChange={theme => change(`${THEME}.${ICON_PATH}`, theme)} />
				</InputContainer>
			</div>
		</div>
	);
}

Editor.propTypes = {
	onChange: PropTypes.func
};
