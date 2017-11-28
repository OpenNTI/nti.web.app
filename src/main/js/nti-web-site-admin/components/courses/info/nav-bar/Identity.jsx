import React from 'react';
import PropTypes from 'prop-types';
import {Presentation} from 'nti-web-commons';

SiteAdminCourseIdentity.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminCourseIdentity ({course}) {
	const {title, label} = course.getPresentationProperties();

	return (
		<div className="site-admin-course-identity">
			<Presentation.Asset contentPackage={course} type="landing">
				<img className="course-icon" />
			</Presentation.Asset>
			<div className="info">
				<div className="label">{label}</div>
				<div className="title">{title}</div>
			</div>
		</div>
	);
}
