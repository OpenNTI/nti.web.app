import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { Text } from '@nti/web-commons';

import Styles from './Text.css';

const cx = classnames.bind(Styles);

function Factory(variant, tag) {
	WithClassName.propTypes = {
		className: PropTypes.string,
		right: PropTypes.bool,
		center: PropTypes.bool,
	};
	function WithClassName({ className, right, center, ...otherProps }) {
		return (
			<Text.Base
				className={cx(className, variant, 'text', { right, center })}
				as={tag}
				{...otherProps}
			/>
		);
	}

	return WithClassName;
}

export default {
	Base: Factory(),
	Title: Factory('title'),
	Description: Factory('description'),
	Small: Factory('small'),
	Badge: Factory('badge'),
};
