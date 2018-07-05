import React from 'react';
import PropTypes from 'prop-types';
import {List} from '@nti/web-reports';

import Card from '../../common/Card';

SiteAdminUserEnrollmentReports.propTypes = {
	userBookRecord: PropTypes.object
};
export default function SiteAdminUserEnrollmentReports ({userBookRecord}) {
	return userBookRecord ?
		(<Card><List context={userBookRecord} /></Card>) :
		null;
}
