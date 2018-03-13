import React from 'react';
import { Widgets } from 'nti-web-reports';

import ActiveSessions from './widgets/ActiveSessions';
import ActiveTimes from './widgets/ActiveTimes';
import PopularCourses from './widgets/PopularCourses';
import RecentlyCreatedUsers from './widgets/RecentlyCreatedUsers';
import RecentSessions from './widgets/RecentSessions';

const { ActiveDays, ActiveUsers } = Widgets;

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	renderWidgets () {
		return (
			<div className="admin-dashboard-widgets">
				<div className="widget-row">
					<ActiveSessions/>
					<PopularCourses/>
					<ActiveUsers/>
				</div>
				<div className="widget-row">
					<ActiveTimes/>
					<div>
						<RecentlyCreatedUsers/>
						<RecentSessions/>
					</div>
				</div>
				<div className="widget-row">
					<ActiveDays/>
				</div>
			</div>
		);
	}

	render () {
		return (
			<div className="admin-dashboard">
				{this.renderWidgets()}
			</div>
		);
	}
}
