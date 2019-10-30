import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Header from './Header';
import styles from './View.css';

const cx = classnames.bind(styles);

export default function Preview (props) {
	return (
		<div className={cx('preview-root')}>
			<Header />
		</div>
	);
}