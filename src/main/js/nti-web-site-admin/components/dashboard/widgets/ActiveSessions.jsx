import React from 'react';
import {NumericValue, UpdateWithFrequency} from 'nti-web-charts';
import {getService} from 'nti-web-client';
import {getLink} from 'nti-lib-interfaces';

const SESSIONS = 'Sessions';
const ANALYTICS = 'Analytics';
const ACTIVE_SESSION_COUNT = 'active_session_count';

export default class ActiveSessions extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	async getActiveSessions () {
		const service = await getService();
		const sessionsCollection = service.getCollection(SESSIONS, ANALYTICS);
		const link = getLink(sessionsCollection, ACTIVE_SESSION_COUNT);
		const stats = await service.get(link);
		return {value: stats.Count};
	}

	render () {
		return (
			<div className="active-sessions-widget">
				<UpdateWithFrequency frequency={30000} selectData={this.getActiveSessions}>
					<NumericValue label="Learners Online Now"/>
				</UpdateWithFrequency>
			</div>
		);
	}
}
