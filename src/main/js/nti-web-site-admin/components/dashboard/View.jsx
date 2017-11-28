import React from 'react';

import ActiveSessions from './widgets/ActiveSessions';
import ActiveTimes from './widgets/ActiveTimes';
import PopularCourses from './widgets/PopularCourses';
import ActiveUsers from './widgets/ActiveUsers';

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	renderWidgets () {
		return (<div className="admin-dashboard-widgets">
			<div className="widget-row">
				<ActiveSessions/>
				<PopularCourses/>
				<ActiveUsers/>
			</div>
			<div className="widget-row">
				<ActiveTimes/>
			</div>
		</div>);
	}

	render () {
		return (<div className="admin-dashboard">
			{this.renderWidgets()}
		</div>);
	}
}
