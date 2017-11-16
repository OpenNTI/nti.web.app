import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName} from 'nti-web-commons';
import {LinkTo} from 'nti-web-routing';

SiteAdminUserIdentity.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminUserIdentity ({user}) {
	return (
		<div className="site-admin-user-identity">
			<Avatar entity={user} />
			<DisplayName entity={user} />
			<LinkTo.Object object={user}>
				Go to Profile
			</LinkTo.Object>
		</div>
	);
}
