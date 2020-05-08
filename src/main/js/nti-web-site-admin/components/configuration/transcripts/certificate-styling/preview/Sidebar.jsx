import React from 'react';
import classnames from 'classnames/bind';
import {Theme, Image} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);

export default function CertificatePreviewSidebar () {
	const logo = Theme.useThemeProperty('sidebar.logo');
	const hasLogo = Boolean(logo?.href);

	const backgroundColor = Theme.useThemeProperty('sidebar.backgroundColor');
	const hasBackgroundColor = Boolean(backgroundColor);

	const image = Theme.useThemeProperty('sidebar.image');
	const hasImage = Boolean(image?.href);

	const styles = {};
	let asset = null;

	if (hasImage) {
		asset = (<Theme.Asset name="sidebar.image" className={cx('side-bar-image')} />);
	} else if (hasLogo && hasBackgroundColor) {
		styles.backgroundColor = backgroundColor;
		asset = (<Theme.Asset name="sidebar.logo" className={cx('side-bar-logo')} />);
	} else if (image.fallback) {
		asset = (<Image src={image.fallback} className={cx('side-bar-image')} />);
	}

	return (
		<div className={cx('side-bar')} style={styles}>
			{asset}
		</div>
	);
} 