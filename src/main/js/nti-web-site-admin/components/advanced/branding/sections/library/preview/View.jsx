import React from 'react';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Header from './Header';
import styles from './View.css';

const cx = classnames.bind(styles);

export default function Preview () {
	return (
		<Theme.Scope scope="library">
			<div className={cx('preview-root')}>
				<Header />
			</div>
		</Theme.Scope>
	);
}
