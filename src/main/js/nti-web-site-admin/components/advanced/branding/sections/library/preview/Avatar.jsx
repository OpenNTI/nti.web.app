import React from 'react';
import {Avatar as Av, User} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Avatar.css';

const cx = classnames.bind(styles);

export default function Avatar () {
	return (
		<div className={cx('avatar-root')}>
			<Av me />
			<div className={cx('presence')}>
				<User.Presence me />
			</div>
		</div>
	);
}
