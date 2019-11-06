import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './NotificationsIcon.css';

const cx = classnames.bind(styles);

export default function NotificationsIcon (props) {
	return (
		<div className={cx('notifications-icon')} />
	);
}
