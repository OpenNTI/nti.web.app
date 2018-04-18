import React from 'react';
import PropTypes from 'prop-types';
import { Widgets } from '@nti/web-reports';
import { getService } from '@nti/web-client';

import DateValue from '../../../common/DateValue';

import ActiveTimes from './ActiveTimes';
import RecentSessions from './RecentSessions';
import LastLogin from './LastLogin';

const { ActiveDays } = Widgets;

const HISTORICAL_SESSIONS_LINK = 'HistoricalSessions';

const NUM_SESSIONS_TO_SHOW = 5;

export default class SiteAdminUserOverview extends React.Component {
	static propTypes = {
		user: PropTypes.object
	}

	constructor (props) {
		super(props);

		this.state = {loading: true};
	}

	componentDidMount () {
		this.loadData();
	}

	async loadData () {
		const { user } = this.props;

		try {
			const service = await getService();
			const historicalSessions = user.Links.filter(x => x.rel === HISTORICAL_SESSIONS_LINK)[0] || {};
			const results = historicalSessions ? await service.get(historicalSessions.href) : {};
			const items = (results.Items || []).slice(0, NUM_SESSIONS_TO_SHOW);

			this.setState({loading: false, historicalSessions: items});
		} catch (e) {
			this.setState({loading: false, historicalSessions: []});
		}
	}

	render () {
		const { user } = this.props;
		const { loading, historicalSessions } = this.state;

		return (
			<div className="site-admin-user-overview">
				<div className="joined">
					<DateValue date={user.getCreatedTime()} label="Joined" />
				</div>
				<div className="last-login">
					<LastLogin user={user} loading={loading} historicalSessions={historicalSessions}/>
				</div>
				<div className="activity-by-day">
					<ActiveDays entity={user}/>
				</div>
				<div className="active-times">
					<ActiveTimes user={user}/>
				</div>
				<div className="recent-sessions">
					<RecentSessions user={user} loading={loading} historicalSessions={historicalSessions}/>
				</div>
			</div>
		);
	}
}
