import React from 'react';
import PropTypes from 'prop-types';
import {Avatar} from 'nti-web-commons';

SiteAdminUserIdentity.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminUserIdentity ({user}) {
	return (
		<div className="site-admin-user-identity">
			<Avatar entity={user} />
		</div>
	);
}
