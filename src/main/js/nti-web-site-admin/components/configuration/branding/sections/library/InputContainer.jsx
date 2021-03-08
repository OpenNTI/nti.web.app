import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Text } from '@nti/web-commons';

import Styles from './InputContainer.css';

const cx = classnames.bind(Styles);

LibraryInputContainer.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string,
	children: PropTypes.any,
};
export default function LibraryInputContainer({ className, label, children }) {
	const input = React.Children.only(children);

	return (
		<div className={cx('input-container', className)}>
			{label && <Text.Base className={cx('label')}>{label}</Text.Base>}
			{input}
		</div>
	);
}
