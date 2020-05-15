import React from 'react';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Theme, Text, DateTime} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped('web-site-admin.components.advanced.transcripts.certificate-styling.preview.Content', {
	recipientName: 'Recipient Name',
	courseId: 'Course ID',
	courseName: 'Course Name',
	date: 'Awarded on %(date)s'
});

export default function CertificateInlinePreviewContent () {
	const brandName = Theme.useTheme()?.getRoot?.()?.brandName;// 'brandName' in theme, 'brand_name' in SiteBrand

	const label = Theme.useThemeProperty('label');
	const date = DateTime.format(Date.now(), 'MMMM D, YYYY');

	return (
		<div className={cx('content')}>
			<Text.Base className={cx('label')}>{brandName} {label}</Text.Base>
			<Text.Base className={cx('recipient')}>{t('recipientName')}</Text.Base>
			<Text.Base className={cx('date')}>{t('date', {date})}</Text.Base>
			<Text.Base className={cx('course-id')}>{t('courseId')}</Text.Base>
			<Text.Base className={cx('course-name')}>{t('courseName')}</Text.Base>
		</div>
	);
}