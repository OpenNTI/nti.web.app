import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './ImageInput.css';

const cx = classnames.bind(styles);

export default function ImageInput ({onChange, children}) {
	return (
		<button role="button" className={cx('image-input')}>
			<input type="file" onChange={onChange} accept="image/*" />
			{children}
		</button>
	);
}
