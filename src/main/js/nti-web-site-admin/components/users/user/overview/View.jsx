import React from 'react';
import PropTypes from 'prop-types';

import DateValue from '../../../common/DateValue';

import ActiveTimes from './ActiveTimes';
import RecentSessions from './RecentSessions';
import ActiveDays from './ActiveDays';

SiteAdminUserOverview.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminUserOverview ({user}) {
	return (
		<div className="site-admin-user-overview">
			<div className="joined">
				<DateValue date={user.getCreatedTime()} label="Joined" />
			</div>
			<div className="last-login">
				<DateValue date={user.getLastLoginTime()} label="Last Login" format="lll" />
			</div>
			<div className="activity-by-day">
				<ActiveDays user={user}/>
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
