import React from 'react';
import PropTypes from 'prop-types';
import { Avatar as Av, User } from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Avatar.css';

const cx = classnames.bind(styles);

export default function Avatar({ presence, className }) {
	return (
		<div className={cx('avatar-root', className)}>
			<Av me />
			{presence && (
				<div className={cx('presence')}>
					<User.Presence me />
				</div>
			)}
		</div>
	);
}

Avatar.propTypes = {
	presence: PropTypes.bool,
};
