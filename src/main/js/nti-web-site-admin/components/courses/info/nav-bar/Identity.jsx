import React from 'react';
import PropTypes from 'prop-types';

SiteAdminCourseIdentity.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminCourseIdentity ({course}) {
	const {title} = course;

	return (
		<span>{title}</span>
	);
}
