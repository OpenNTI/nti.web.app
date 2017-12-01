import React from 'react';
import PropTypes from 'prop-types';
import {getService} from 'nti-web-client';
import {DateTime, Loading} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const HISTORICAL_SESSIONS_LINK = 'HistoricalSessions';

const NUM_SESSIONS_TO_SHOW = 5;

const LABELS = {
	title: 'Recent Sessions',
	noSessions: 'No recent sessions',
	today: 'Today'
};

const t = scoped('nti-web-site-admins.components.users.user.overview.recentsessions', LABELS);

export default class RecentSessions extends React.Component {
	static propTypes = {
		user: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);

		this.state = {
			loading: true
		};
	}

	componentDidMount () {
		this.loadData();
	}

	loadData () {
		const { user } = this.props;

		getService().then(service => {
			const historicalSessions = user.Links.filter(x => x.rel === HISTORICAL_SESSIONS_LINK)[0] || {};

			service.get(historicalSessions.href).then(results => {
				const items = (results.Items || []).reverse().slice(0, NUM_SESSIONS_TO_SHOW);

				this.setState({loading: false, items});
			});
		});
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
		const { loading, items } = this.state;

		if(loading) {
			return <Loading.Mask/>;
		}

		if(!items || items.length === 0) {
			return (<div className="no-sessions">{t('noSessions')}</div>);
		}

		return (
			<div className="items">
				{items.map(this.renderItem)}
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
