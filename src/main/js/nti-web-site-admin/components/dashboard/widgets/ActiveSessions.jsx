import React from 'react';
import {NumericValue, UpdateWithFrequency} from '@nti/web-charts';
import {getService} from '@nti/web-client';
import {getLink} from '@nti/lib-interfaces';
import {scoped} from '@nti/lib-locale';

const SESSIONS = 'Sessions';
const ANALYTICS = 'Analytics';
const ACTIVE_SESSION_COUNT = 'active_session_count';

const LABELS = {
	notAvailable: 'Unable to get active session data'
};

const t = scoped('nti-web-site-admin.components.dashboard.widgets.ActiveSessions', LABELS);

export default class ActiveSessions extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	async getActiveSessions () {
		const service = await getService();

		try {
			const sessionsCollection = service.getCollection(SESSIONS, ANALYTICS);
			const link = getLink(sessionsCollection, ACTIVE_SESSION_COUNT);
			const stats = await service.get(link);

			return {value: stats.Count};
		}
		catch (e) {
			return {value: (<div className="not-available">{t('notAvailable')}</div>)};
		}
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
