import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './SearchBar.css';

const cx = classnames.bind(styles);

export default function SearchBar (props) {
	return (
		<div className={cx('search-bar')}>
			Search
			<div className={cx('icon')} />
		</div>
	);
}
