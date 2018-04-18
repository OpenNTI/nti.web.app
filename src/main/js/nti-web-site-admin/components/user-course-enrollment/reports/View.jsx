import React from 'react';
import PropTypes from 'prop-types';
import {List} from '@nti/web-reports';

import Card from '../../common/Card';

SiteAdminUserEnrollmentReports.propTypes = {
	enrollment: PropTypes.object
};
export default function SiteAdminUserEnrollmentReports ({enrollment}) {
	return enrollment ?
		(<Card><List context={enrollment} /></Card>) :
		null;
}
