import React from 'react';
import classnames from 'classnames/bind';

import Communities from './Communities';
import Courses from './Courses';
import styles from './Library.css';

const cx = classnames.bind(styles);

export default function Library (props) {
	return (
		<div className={cx('library-root')}>
			<Communities />
			<Courses />
		</div>
	);
}
