import React from 'react';
import PropTypes from 'prop-types';

import {List} from 'nti-web-reports';

SiteAdminUserEnrollmentReports.propTypes = {
	enrollment: PropTypes.object
};
export default function SiteAdminUserEnrollmentReports ({enrollment}) {
	return enrollment ?
		(<List object={enrollment} />) :
		null;
}
