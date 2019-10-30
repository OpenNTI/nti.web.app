import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import styles from './Editor.css';

const cx = classnames.bind(styles);

export default function Editor (props) {
	return (
		<div className={cx('editor-root')}>
			editor
		</div>
	);
}
