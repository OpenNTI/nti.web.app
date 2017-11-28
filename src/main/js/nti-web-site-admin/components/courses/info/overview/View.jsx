import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';

import LabeledValue from '../../../common/LabeledValue';

const DEFAULT_TEXT = {
	totalEnrollments: 'Total Enrollments'
};
const t = scoped('nti-web-site-admin.courses.course.Overview', DEFAULT_TEXT);


SiteAdminCourseOverview.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminCourseOverview ({course}) {
	return (
		<LabeledValue label={t('totalEnrollments')}>
			{course.enrolledTotalCount || 0}
		</LabeledValue>
	);
}
