import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName, Presentation} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

const DEFAULT_TEXT = {
	activityFor: 'Activity for',
	in: 'in'
};

const t = scoped('nti-site-admin.users.user.Identity', DEFAULT_TEXT);

SiteAdminUserIdentity.propTypes = {
	book: PropTypes.object,
	user: PropTypes.object
};
export default function SiteAdminUserIdentity ({book, user}) {
	return (
		<div className="site-admin-user-enrollment-identity">
			<div className="profile-image">
				<Presentation.Asset contentPackage={book} type="landing">
					<img className="enrollment-course-image"/>
				</Presentation.Asset>
				<div className="user-avatar">
					<Avatar entity={user}/>
				</div>
			</div>
			<div className="enrollment-info">
				<div className="plain-text">{t('activityFor')}</div>
				<DisplayName entity={user} />
				<div className="plain-text">{t('in')}</div>
				<div className="course-title">
					{book && book.title}
				</div>
			</div>
		</div>
	);
}
