import React from 'react';
import PropTypes from 'prop-types';
import {DialogButtons} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Apply.css';

const cx = classnames.bind(styles);

const f = fn => e => {
	e.stopPropagation();
	e.preventDefault();
	fn(e);
};

export default function Apply ({disabled, onSave, onCancel}) {
	const buttons = [
		{
			label: 'Cancel',
			onClick: f(onCancel),
			disabled,
		},
		{
			label: 'Apply Changes',
			onClick: f(onSave),
			disabled,
		}
	];
	return (
		<DialogButtons flat buttons={buttons} className={cx('apply')} />
	);
}

Apply.propTypes = {
	onCancel: PropTypes.func,
	onSave: PropTypes.func,
	disabled: PropTypes.bool
};
