import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Avatar from './Avatar';
import NotificationsIcon from './NotificationsIcon';
import styles from './Header.css';
import SearchBar from './SearchBar';

const cx = classnames.bind(styles);

export default function PreviewHeader () {
	const color = Theme.useThemeProperty('navigation.backgroundColor');
	const hex = (color && color.isColor) ? color.hex.toString() : color;
	const props = hex ? {
		style: {
			backgroundColor: hex
		}
	} : {};

	return (
		<div className={cx('root')} {...props}>
			<Theme.Asset name="navigation.branding" className={cx('logo')} />
			<SearchBar />
			<div className={cx('icons')}>
				<NotificationsIcon />
				<Avatar presence />
			</div>
		</div>
	);
}

PreviewHeader.propTypes = {
	theme: PropTypes.shape({
		navigation: PropTypes.shape({
			backgroundColor: PropTypes.oneOfType([
				PropTypes.string, // css color string
				PropTypes.shape({ // @nti/lib-commons Color
					isColor: PropTypes.bool,
					hex: PropTypes.shape({
						toString: PropTypes.func.isRequired
					})
				}),
			])
		})
	})
};
