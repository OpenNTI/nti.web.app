import React from 'react';
import PropTypes from 'prop-types';
import {DialogButtons, Prompt} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Reset.css';

const cx = classnames.bind(styles);

const f = fn => e => {
	e.stopPropagation();
	e.preventDefault();
	Prompt.areYouSure('Reset everything to defaults?').then(fn);
};

export default function Reset ({hasChanges, onReset}) {
	const buttons = [
		{
			label: 'Reset to Defaults',
			onClick: f(onReset)
		}
	];
	return (
		<DialogButtons flat buttons={buttons} className={cx('reset')} />
	);
}

Reset.propTypes = {
	onReset: PropTypes.func,
	hasChanges: PropTypes.bool
};
