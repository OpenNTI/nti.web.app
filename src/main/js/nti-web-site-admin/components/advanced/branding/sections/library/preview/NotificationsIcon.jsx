import React from 'react';
import PropTypes from 'prop-types';
import {Theme} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './NotificationsIcon.css';

const cx = classnames.bind(styles);

export default function NotificationsIcon (props) {
	const mode = Theme.useThemeProperty('navigation.icon');
	return (
		<div className={cx('notifications-icon', mode)} />
	);
}
