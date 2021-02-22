import React from 'react';
import PropTypes from 'prop-types';
import { Button, Prompt } from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './Reset.css';

const cx = classnames.bind(styles);

const title = 'Reset everything to defaults?';
const message = `
	This will undo any branding overrides that have been set in the platform and login app.
	For a child site the branding will be set to the parent site's branding. Otherwise it
	will be set to NextThought branding.
`;

const f = fn => e => {
	e.stopPropagation();
	e.preventDefault();
	Prompt.areYouSure(message, title).then(fn);
};

export default function Reset({ onReset, canReset }) {
	if (!canReset) {
		return null;
	}

	return (
		<Button onClick={f(onReset)} className={cx('reset')}>
			Reset to Defaults
		</Button>
	);
}

Reset.propTypes = {
	onReset: PropTypes.func,
	canReset: PropTypes.bool,
};
