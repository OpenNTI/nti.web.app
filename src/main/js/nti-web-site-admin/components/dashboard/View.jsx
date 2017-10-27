import React from 'react';

import ActiveSessions from './widgets/ActiveSessions';
import ActiveTimes from './widgets/ActiveTimes';

export default class View extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	renderWidgets () {
		return (<div className="admin-dashboard-widgets">
			<div className="widget-row">
				<ActiveSessions/>
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
