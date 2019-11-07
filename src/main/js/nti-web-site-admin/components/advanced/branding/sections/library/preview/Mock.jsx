import React from 'react';
import {Theme} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Mock.css';
import Header from './Header';

const cx = classnames.bind(styles);

export default function Mock () {
	return (
		<div className={cx('mock-root', Theme.useThemeProperty('background'))}>
			<Header />
		</div>		
	);
}
