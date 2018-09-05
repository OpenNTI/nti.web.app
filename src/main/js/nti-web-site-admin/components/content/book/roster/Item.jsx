import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName} from '@nti/web-commons';

SiteAdminBookRosterItem.propTypes = {
	item: PropTypes.object.isRequired
};
export default function SiteAdminBookRosterItem ({item}) {
	return (
		<div className="site-admin-course-roster-item">
			<Avatar entity={item} className="user-avatar"/>
			<div className="info">
				<DisplayName entity={item} className="username" />
			</div>
		</div>
	);
}
