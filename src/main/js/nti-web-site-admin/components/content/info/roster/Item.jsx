import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName} from '@nti/web-commons';
import {CircularProgress} from '@nti/web-charts';

SiteAdminCourseRosterItem.propTypes = {
	item: PropTypes.object.isRequired
};
export default function SiteAdminCourseRosterItem ({item}) {
	const {user, CourseProgress} = item;
	const progress = CourseProgress && Math.floor((CourseProgress.PercentageProgress || 0) * 100);

	return (
		<div className="site-admin-course-roster-item">
			<Avatar entity={user} className="user-avatar"/>
			<div className="info">
				<DisplayName entity={user} className="username" />
			</div>
			{CourseProgress && (
				<div className="progress">
					<CircularProgress value={progress} width={40} height={40} />
				</div>
			)}
		</div>
	);
}
