import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName} from 'nti-web-commons';

SiteAdminCourseRosterItem.propTypes = {
	item: PropTypes.object.isRequired
};
export default function SiteAdminCourseRosterItem ({item}) {
	const {user} = item;

	return (
		<div className="site-admin-course-roster-item">
			<Avatar entity={user} className="user-avatar"/>
			<div className="info">
				<DisplayName entity={user} className="username" />
			</div>
		</div>
	);
}
