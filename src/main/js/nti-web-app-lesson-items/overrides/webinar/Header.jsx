import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { DateTime } from '@nti/web-commons';
import { Event } from '@nti/web-calendar';
import { scoped } from '@nti/lib-locale';

import styles from './Header.css';

const t = scoped('lessonitems.events.webinar', {
	type: 'webinar',
});

const cx = classnames.bind(styles);

export default class Header extends React.Component {
	render() {
		const {
			item: { title, webinar, completed, expired },
		} = this.props;

		const nearestSession = webinar.getNearestSession();
		const startTime = nearestSession.getStartTime();
		const endTime = nearestSession.getEndTime();

		return (
			<header className={cx('header')}>
				<DateTime.DateIcon
					minimal
					date={startTime}
					className={cx('start-date')}
				/>
				<h1 className={cx('title')}>{title}</h1>
				<Event.Availability
					{...{
						eventType: t('type'),
						startTime,
						endTime,
						completed,
						expired,
					}}
				/>
			</header>
		);
	}
}

Header.propTypes = {
	item: PropTypes.shape({
		title: PropTypes.string,
		webinar: PropTypes.shape({
			getNearestSession: PropTypes.func.isRequired,
		}).isRequired,
		completed: PropTypes.bool,
		expired: PropTypes.bool,
	}).isRequired,
};
