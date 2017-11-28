import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';

import CourseInfo from '../CourseInfo';

const DEFAULT_TEXT = {
	totalEnrolled: 'Total Enrolled:'
};
const t = scoped('nti-web-site-admin.courses.list.Item', DEFAULT_TEXT);

SiteAdminCourseItem.propTypes = {
	item: PropTypes.object
};
export default function SiteAdminCourseItem ({item}) {
	const {enrolledTotalCount} = item;

	return (
		<div className="site-admin-course-item">
			<CourseInfo className="course-info" catalogEntry={item.CatalogEntry} />
			<div className="total-enrollments">
				<div className="label">
					{t('totalEnrolled')}
				</div>
				<div className="value">
					{enrolledTotalCount || 0}
				</div>
			</div>
		</div>
	);
}
