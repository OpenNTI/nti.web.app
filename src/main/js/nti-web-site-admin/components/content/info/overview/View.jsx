import React from 'react';
import PropTypes from 'prop-types';
import { AdminTools } from 'nti-web-course';

SiteAdminCourseOverview.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminCourseOverview ({course}) {
	return (
		<AdminTools.Dashboard course={course} />
	);
}
