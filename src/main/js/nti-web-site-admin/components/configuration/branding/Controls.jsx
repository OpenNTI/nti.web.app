import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { DialogButtons } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';

import styles from './Controls.css';

const cx = classnames.bind(styles);
const t = scoped('nti-web-app.admin.branding.Controls', {
	preview: 'Preview and Apply',
	cancel: 'Cancel',
});

const f = fn => e => {
	e.stopPropagation();
	e.preventDefault();
	fn(e);
};

export default function Controls({ onPreview, onCancel }) {
	const buttons = [
		{
			label: t('cancel'),
			onClick: f(onCancel),
		},
		{
			label: t('preview'),
			onClick: f(onPreview),
		},
	];
	return <DialogButtons flat buttons={buttons} className={cx('apply')} />;
}

Controls.propTypes = {
	onCancel: PropTypes.func,
	onPreview: PropTypes.func,
};
