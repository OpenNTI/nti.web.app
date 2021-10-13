import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Theme } from '@nti/web-commons';

import styles from './NotificationsIcon.css';

const cx = classnames.bind(styles);

export default function NotificationsIcon({
	mode = Theme.useThemeProperty('navigation.icon'),
}) {
	return <div className={cx('notifications-icon', mode)} />;
}

NotificationsIcon.propTypes = {
	mode: PropTypes.string,
};
