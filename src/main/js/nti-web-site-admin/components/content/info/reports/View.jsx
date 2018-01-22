import React from 'react';
import PropTypes from 'prop-types';

import {List} from 'nti-web-reports';

import Card from '../../../common/Card';


SiteAdminCourseReports.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminCourseReports ({course}) {
	return course ?
		(<Card><List context={course} /></Card>) :
		null;
}
