import React from 'react';
import PropTypes from 'prop-types';

import DateValue from '../../../common/DateValue';
import ActiveDays from '../../../common/ActiveDays';

import ActiveTimes from './ActiveTimes';
import RecentSessions from './RecentSessions';

SiteAdminUserOverview.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminUserOverview ({user}) {
	const { MostRecentSession } = user;

	const sessionDate = (MostRecentSession && MostRecentSession.getSessionStartTime()) || user.getLastLoginTime();

	return (
		<div className="site-admin-user-overview">
			<div className="joined">
				<DateValue date={user.getCreatedTime()} label="Joined" />
			</div>
			<div className="last-login">
				<DateValue date={sessionDate} label="Last Login" format="lll" />
			</div>
			<div className="activity-by-day">
				<ActiveDays entity={user}/>
			</div>
			<div className="active-times">
				<ActiveTimes user={user}/>
			</div>
			<div className="recent-sessions">
				<RecentSessions user={user}/>
			</div>
		</div>
	);
}
