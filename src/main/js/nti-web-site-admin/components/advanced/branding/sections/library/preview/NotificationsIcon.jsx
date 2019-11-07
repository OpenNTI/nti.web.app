import React from 'react';
import {Theme} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './NotificationsIcon.css';

const cx = classnames.bind(styles);

export default function NotificationsIcon () {
	const mode = Theme.useThemeProperty('navigation.icon');
	return (
		<div className={cx('notifications-icon', mode)} />
	);
}
