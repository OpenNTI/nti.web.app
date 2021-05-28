import React from 'react';
import classnames from 'classnames/bind';

import { Theme } from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);

export default function CertificatePreviewSidebar() {
	const hideLogo = Theme.useTheme()?.getRoot()?.suppressCertificateLogo;
	const backgroundColor = Theme.useThemeProperty('sidebar.backgroundColor');

	const styles = {};

	if (backgroundColor) {
		styles.backgroundColor = backgroundColor.isColor
			? backgroundColor.hex.toString()
			: backgroundColor;
	}

	return (
		<div className={cx('side-bar')} style={styles}>
			<Theme.Asset
				name="sidebar.image"
				className={cx('side-bar-image')}
			/>
			{!hideLogo && (
				<div className={cx('logo-container')}>
					<Theme.Asset
						name="sidebar.logo"
						className={cx('sidebar-logo')}
					/>
				</div>
			)}
		</div>
	);
}
