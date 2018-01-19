import React from 'react';
import PropTypes from 'prop-types';
import {List} from 'nti-web-reports';

import Card from '../../../common/Card';


SiteAdminCourseReports.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminCourseReports ({user}) {
	return user ?
		(<Card><List context={user} /></Card>) :
		null;
}

