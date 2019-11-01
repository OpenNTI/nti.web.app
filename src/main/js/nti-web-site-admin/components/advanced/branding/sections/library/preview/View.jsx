import React from 'react';
import classnames from 'classnames/bind';

import {libraryTheme} from '../prop-types';

import Header from './Header';
import styles from './View.css';

const cx = classnames.bind(styles);

export default function Preview ({theme}) {
	return (
		<div className={cx('preview-root')}>
			<Header theme={theme} />
		</div>
	);
}

Preview.propTypes = {
	...libraryTheme
};
