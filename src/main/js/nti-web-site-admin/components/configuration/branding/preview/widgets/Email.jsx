import React from 'react';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { Theme } from '@nti/web-commons';

import styles from './Email.css';

const cx = classnames.bind(styles);

const t = scoped(
	'nti-web-site-admin.components.advanced.branding.preview.email',
	{
		title: 'Welcome to the Course',
		description:
			'Our connected learning platform offers a unique and fun way to learn online, both alone and together. In addition to the great instructional content and exercises you will experience, you are joining a true learning community built to connect, engage, and inspire you and your peers.',
	}
);

export default function Email() {
	const color = Theme.useThemeProperty('brandColor');

	return (
		<div className={cx('root')} style={{ borderTop: `5px solid ${color}` }}>
			<Theme.Asset className={cx('logo')} name="assets.email" />
			<div className={cx('title')}>{t('title')}</div>
			<div className={cx('description')}>{t('description')}</div>
		</div>
	);
}
