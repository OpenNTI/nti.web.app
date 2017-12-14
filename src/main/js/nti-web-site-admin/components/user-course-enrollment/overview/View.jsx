import React from 'react';
import PropTypes from 'prop-types';

SiteAdminUserEnrollmentOverview.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminUserEnrollmentOverview ({user}) {
	return (
		<div className="site-admin-user-enrollment-overview">
			<div>Overview goes here</div>
		</div>
	);
}
