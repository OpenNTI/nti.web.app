import React from 'react';
import PropTypes from 'prop-types';

import ActiveDays from '../../../common/ActiveDays';
import ActiveUsers from '../../../common/ActiveUsers';
import ActiveTimes from '../../info/overview/ActiveTimes';

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
