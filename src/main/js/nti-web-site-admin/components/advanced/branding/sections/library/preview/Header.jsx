import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './Header.css';

const cx = classnames.bind(styles);

const yoink = (item, path) => {
	const [, part, rest] = /^([^.]+)\.*(.*)/.exec(path) || [];
	if (!part) {
		return null;
	}
	const o = (item || {})[part];
	if (o == null) {
		return null;
	}
  
	return rest.length ? yoink(o, rest) : o;
};

export default function PreviewHeader ({theme}) {
	const color = yoink(theme, 'navigation.backgroundColor.hex');
	const hex = color && color.toString();
	console.log(hex);
	return (
		<div className={cx('root')} style={{backgroundColor: hex}}>

		</div>
	);
}
