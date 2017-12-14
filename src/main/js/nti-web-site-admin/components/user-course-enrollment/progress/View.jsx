import React from 'react';
import PropTypes from 'prop-types';

SiteAdminUserEnrollmentProgress.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminUserEnrollmentProgress ({user}) {
	return (
		<div className="site-admin-user-enrollment-progress">
			<div>Progress info goes here</div>
		</div>
	);
}
