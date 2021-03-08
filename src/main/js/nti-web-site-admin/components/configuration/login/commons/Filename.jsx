import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Text } from '@nti/web-commons';

import Styles from './Filename.css';

const cx = classnames.bind(Styles);

Filename.propTypes = {
	className: PropTypes.string,
	file: PropTypes.string,
};
export default function Filename({ className, file }) {
	const parts = file.split('.');
	const ext = parts.pop();
	const name = parts.join('.');

	return (
		<Text.Base className={cx('file-name', className)}>
			{name && <span className={cx('name')}>{name}</span>}
			{ext && <span className={cx('ext')}>.{ext}</span>}
		</Text.Base>
	);
}
