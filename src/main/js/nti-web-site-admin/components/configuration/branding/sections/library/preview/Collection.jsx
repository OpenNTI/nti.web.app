import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { Theme } from '@nti/web-commons';

import styles from './Collection.css';

const cx = classnames.bind(styles);

export default function Collection({ title, children }) {
	const mode = Theme.useThemeProperty('background');

	return (
		<div className={cx('collection', mode)}>
			{title && (
				<div className={cx('section-heading')}>
					<h1 className={cx('title')}>{title}</h1>
				</div>
			)}
			{children}
		</div>
	);
}

Collection.propTypes = {
	title: PropTypes.string,
};
