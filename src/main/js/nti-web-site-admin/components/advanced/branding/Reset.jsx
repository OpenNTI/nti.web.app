import React from 'react';
import PropTypes from 'prop-types';
import {Button, Prompt} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Reset.css';

const cx = classnames.bind(styles);

const f = fn => e => {
	e.stopPropagation();
	e.preventDefault();
	Prompt.areYouSure('Reset everything to defaults?').then(fn);
};

export default function Reset ({onReset}) {
	return (
		<Button onClick={f(onReset)} className={cx('reset')}>Reset to Defaults</Button>
	);
}

Reset.propTypes = {
	onReset: PropTypes.func,
};
