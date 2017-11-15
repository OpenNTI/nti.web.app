import React from 'react';
import PropTypes from 'prop-types';

import DateValue from '../../../common/DateValue';

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
		</div>
	);
}
