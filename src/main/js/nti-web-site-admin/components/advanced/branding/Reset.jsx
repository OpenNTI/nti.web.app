import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Reset.css';

const cx = classnames.bind(styles);

export default function Reset ({onReset}) {
	return (
		<Button onClick={onReset} className={cx('reset')}>Reset to Defaults</Button>
	);
}

Reset.propTypes = {
	onReset: PropTypes.func,
};
