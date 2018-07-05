import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {CircularProgress} from '@nti/web-charts';

import LabeledValue from '../../common/LabeledValue';

const t = scoped('nti-web-site-admin.user-course-enrollment.overview.Progress', {
	label: 'Course Progress'
});

UserCourseEnrollmentOverviewProgress.propTypes = {
	enrollment: PropTypes.object.isRequired
};
export default function UserCourseEnrollmentOverviewProgress ({enrollment}) {
	const {CourseProgress} = enrollment;

	if (!CourseProgress) { return null; }

	const {PercentageProgress} = CourseProgress;
	const percent = Math.floor((PercentageProgress || 0) * 100);

	return (
		<LabeledValue label={t('label')} className="user-course-enrollment-progress">
			<CircularProgress value={percent} showPercentSymbol />
		</LabeledValue>
	);
}
