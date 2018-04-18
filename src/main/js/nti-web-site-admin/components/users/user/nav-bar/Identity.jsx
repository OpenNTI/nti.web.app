import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName} from '@nti/web-commons';
import {LinkTo} from '@nti/web-routing';
import {scoped} from '@nti/lib-locale';

const DEFAULT_TEXT = {
	profile: 'Profile',
	email: 'Email'
};

const t = scoped('nti-site-admin.users.user.Identity', DEFAULT_TEXT);

SiteAdminUserIdentity.propTypes = {
	user: PropTypes.object
};
export default function SiteAdminUserIdentity ({user}) {
	const {email} = user;

	return (
		<div className="site-admin-user-identity">
			<Avatar entity={user} />
			<DisplayName entity={user} />
			<div className="actions">
				<span className="email">
					{email && (
						<a href={`mailto:${email}`}>
							{t('email')}
						</a>
					)}
				</span>
				<LinkTo.Object className="profile" object={user}>
					<i className="icon-goto" />
					<span>{t('profile')}</span>
				</LinkTo.Object>
			</div>
		</div>
	);
}
