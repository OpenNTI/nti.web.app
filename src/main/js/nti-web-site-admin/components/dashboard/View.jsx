import './View.scss';
import React, { Suspense } from 'react';

import { Widgets } from '@nti/web-reports';
import { View as RouterView } from '@nti/web-routing';

import Users from './widgets/Users';
import ActiveTimes from './widgets/ActiveTimes';
import PopularCourses from './widgets/PopularCourses';
import RecentlyCreatedUsers from './widgets/RecentlyCreatedUsers';
import RecentSessions from './widgets/RecentSessions';

const { ActiveDays, ActiveUsers } = Widgets;

export default class View extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	renderWidgets() {
		return (
			<RouterView.WithTitle title="Dashboard">
				<Suspense fallback={<div />}>
					<div className="admin-dashboard-widgets">
						<div className="widget-row">
							<Users />
							<PopularCourses />
							<ActiveUsers />
						</div>
						<div className="widget-row">
							<ActiveTimes />
							<div>
								<RecentlyCreatedUsers />
								<RecentSessions />
							</div>
						</div>
						<div className="widget-row">
							<ActiveDays />
						</div>
					</div>
				</Suspense>
			</RouterView.WithTitle>
		);
	}

	render() {
		return <div className="admin-dashboard">{this.renderWidgets()}</div>;
	}
}
