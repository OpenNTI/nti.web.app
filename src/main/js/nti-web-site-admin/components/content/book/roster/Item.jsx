import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName} from '@nti/web-commons';

SiteAdminBookRosterItem.propTypes = {
	item: PropTypes.object.isRequired
};
export default function SiteAdminBookRosterItem ({item}) {
	const {User} = item;

	return (
		<div className="site-admin-course-roster-item">
			<Avatar entity={User} className="user-avatar"/>
			<div className="info">
				<DisplayName entity={User} className="username" />
			</div>
		</div>
	);
}
