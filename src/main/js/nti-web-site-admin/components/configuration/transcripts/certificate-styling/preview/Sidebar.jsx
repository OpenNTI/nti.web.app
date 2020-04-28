import React from 'react';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);

export default function CertificatePreviewSidebar () {
	const image = Theme.useThemeProperty('sidebar.image');
	const hasImage = Boolean(image?.href);

	const backgroundColor = Theme.useThemeProperty('sidebar.backgroundColor');

	const styles = {};

	if (hasImage) {
		styles.backgroundImage = `url(${image.cacheBustHREF})`;
	} else if (backgroundColor) {
		styles.backgroundColor = backgroundColor;
	}

	return (
		<div className={cx('side-bar')} style={styles}>
			{hasImage && (
				<Theme.Asset property={image} className={cx('side-bar-image')} />
			)}
			{!hasImage && (
				<Theme.Asset name="sidebar.logo" className={cx('side-bar-logo')} />
			)}
		</div>
	);
} 