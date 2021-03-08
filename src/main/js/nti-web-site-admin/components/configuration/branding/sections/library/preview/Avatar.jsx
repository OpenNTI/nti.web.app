import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Avatar as Av, User } from '@nti/web-commons';

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
