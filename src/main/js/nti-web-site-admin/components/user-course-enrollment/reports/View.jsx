import React from 'react';
import PropTypes from 'prop-types';

SiteAdminUserEnrollmentReports.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminUserEnrollmentReports ({user}) {
	return (
		<div className="site-admin-user-enrollment-reports">
			<div>Report info goes here</div>
		</div>
	);
}
