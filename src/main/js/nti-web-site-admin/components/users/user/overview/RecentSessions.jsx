import React from 'react';
import PropTypes from 'prop-types';
import {DateTime, Loading} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

const LABELS = {
	title: 'Recent Sessions',
	noSessions: 'No recent sessions',
	today: 'Today'
};

const t = scoped('nti-web-site-admins.components.users.user.overview.recentsessions', LABELS);

export default class RecentSessions extends React.Component {
	static propTypes = {
		user: PropTypes.object.isRequired,
		historicalSessions: PropTypes.arrayOf(PropTypes.object),
		loading: PropTypes.bool
	}

	constructor (props) {
		super(props);
	}

	renderHeader () {
		return (<div className="header"><div className="title">{t('title')}</div></div>);
	}

	renderItem = (item) => {
		const today = new Date();
		const itemDate = new Date(item.SessionStartTime * 1000);

		let dayLabel = DateTime.format(itemDate, 'dddd');

		if(DateTime.format(today, 'L') === DateTime.format(itemDate, 'L')) {
			dayLabel = t('today');
		}

		return (
			<div key={item.SessionStartTime} className="item">
				<div className="time">{DateTime.format(itemDate, 'lll')}</div>
				<div className="day">{dayLabel}</div>
			</div>
		);
	}

	renderItems () {
		const { loading, historicalSessions } = this.props;

		if(loading) {
			return <Loading.Mask/>;
		}

		if(!historicalSessions || historicalSessions.length === 0) {
			return (<div className="no-sessions">{t('noSessions')}</div>);
		}

		return (
			<div className="items">
				{historicalSessions.map(this.renderItem)}
			</div>
		);
	}

	render () {
		return (
			<div className="user-recent-sessions">
				{this.renderHeader()}
				{this.renderItems()}
			</div>
		);
	}
}
