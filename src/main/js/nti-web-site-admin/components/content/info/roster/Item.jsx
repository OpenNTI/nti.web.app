import './Item.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, DisplayName } from '@nti/web-commons';
import { CircularProgress } from '@nti/web-charts';
import { Enrollment } from '@nti/web-course';

SiteAdminCourseRosterItem.propTypes = {
	item: PropTypes.object.isRequired,
	onChange: PropTypes.func,
};
export default function SiteAdminCourseRosterItem({ item, onChange }) {
	const { user, CourseProgress, CatalogEntryNTIID } = item;
	const progress =
		CourseProgress &&
		Math.floor((CourseProgress.PercentageProgress || 0) * 100);

	return (
		<div className="site-admin-course-roster-item">
			<Avatar entity={user} className="user-avatar" />
			<div className="info">
				<DisplayName entity={user} className="username" />
			</div>
			{CourseProgress && (
				<div className="progress">
					<CircularProgress value={progress} width={40} height={40} />
				</div>
			)}
			{item.hasLink('CourseDrop') && (
				<div className="manage">
					<Enrollment.Admin.Prompt.Trigger
						user={user}
						course={CatalogEntryNTIID}
						onChange={onChange}
					>
						<i className="icon-edit" />
					</Enrollment.Admin.Prompt.Trigger>
				</div>
			)}
		</div>
	);
}
