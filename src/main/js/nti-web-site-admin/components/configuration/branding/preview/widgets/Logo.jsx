import React from 'react';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Avatar from '../../sections/library/preview/Avatar';
import NotificationsIcon from '../../sections/library/preview/NotificationsIcon';

import styles from './Logo.css';

const cx = classnames.bind(styles);

const globalTheme = Theme.getGlobalTheme();

export default function Logo (props) {
	return (
		<div className={cx('root')} {...props}>
			<Theme.Asset name="assets.logo" className={cx('logo')} />
			<div className={cx('course-info')}>
				<div className={cx('course-label')}>NTI-1001</div>
				<div className={cx('course-title')}>Taking Courses Online</div>
				<ul className={cx('course-nav')}>
					<li>Lessons</li>
					<li>Assignments</li>
					<li>Community</li>
					<li>Course Info</li>
				</ul>
			</div>
			<div className={cx('icons')}>
				<div className={cx('search')} />
				<NotificationsIcon mode="dark" />
				<Avatar presence />
			</div>
		</div>
	);
}
