import React from 'react';
import PropTypes from 'prop-types';
import { Widgets } from 'nti-web-reports';

const { ActiveDays, ActiveUsers, ActiveTimes } = Widgets;

SiteAdminBookOverview.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminBookOverview ({course}) {
	return (
		<div className="site-admin-book-overview">
			<div className="site-admin-row">
				<div className="active-users">
					<ActiveUsers entity={course}/>
				</div>
			</div>
			<div className="active-days">
				<ActiveDays entity={course}/>
			</div>
			<div className="active-times">
				<ActiveTimes course={course}/>
			</div>
		</div>
	);
}
