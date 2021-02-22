import React from 'react';
import classnames from 'classnames';
import { Theme } from '@nti/web-commons';

import Avatar from '../../sections/library/preview/Avatar';
import NotificationsIcon from '../../sections/library/preview/NotificationsIcon';

import styles from './Logo.css';

const cx = x => styles[x];

export default function Logo({ className, ...props }) {
	return (
		<div className={classnames(cx('root'), className)} {...props}>
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
