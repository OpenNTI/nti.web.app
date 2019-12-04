import React from 'react';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import styles from './SearchBar.css';

const cx = classnames.bind(styles);

export default function SearchBar () {
	const mode = Theme.useThemeProperty('navigation.search');

	return (
		<div className={cx('search-bar', mode)}>
			Search
			<div className={cx('icon')} />
		</div>
	);
}
