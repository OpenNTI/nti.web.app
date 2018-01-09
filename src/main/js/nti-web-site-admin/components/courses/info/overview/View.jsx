import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';

import LabeledValue from '../../../common/LabeledValue';
import ActiveDays from '../../../common/ActiveDays';
import ActiveUsers from '../../../common/ActiveUsers';

import ActiveTimes from './ActiveTimes';

const DEFAULT_TEXT = {
	totalEnrollments: 'Total Enrollments'
};
const t = scoped('nti-web-site-admin.courses.course.Overview', DEFAULT_TEXT);


SiteAdminCourseOverview.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminCourseOverview ({course}) {
	return (
		<div className="site-admin-course-overview">
			<LabeledValue label={t('totalEnrollments')}>
				{course.enrolledTotalCount || 0}
			</LabeledValue>
			<div className="active-days">
				<ActiveDays entity={course}/>
			</div>
			<div className="active-times">
				<ActiveTimes course={course}/>
			</div>
		</div>
	);
}
