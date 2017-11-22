import React from 'react';
import PropTypes from 'prop-types';
import {Presentation} from 'nti-web-commons';

import CourseInfo from '../CourseInfo';

SiteAdminCourseItem.propTypes = {
	item: PropTypes.object
};
export default function SiteAdminCourseItem ({item}) {
	const {label, title} = item.getPresentationProperties();

	return (
		<div className="site-admin-course-item">
			<CourseInfo catalogEntry={item.CourseInstance.CatalogEntry} />
		</div>
	);
}
