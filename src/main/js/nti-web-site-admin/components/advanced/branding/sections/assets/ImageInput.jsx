import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './ImageInput.css';

const cx = classnames.bind(styles);

const AcceptsOverrides = {
	'favicon': 'image/png'
};

export default function ImageInput ({onChange, name, children}) {
	return (
		<button role="button" className={cx('image-input')}>
			<input type="file" name={name} onChange={onChange} accept={AcceptsOverrides[name] || 'image/*'} />
			{children}
		</button>
	);
}

ImageInput.propTypes = {
	onChange: PropTypes.func,
	name: PropTypes.string,
};
