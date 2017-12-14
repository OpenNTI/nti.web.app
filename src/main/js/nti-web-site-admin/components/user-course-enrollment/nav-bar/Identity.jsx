import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName, Presentation} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	activityFor: 'Activity for',
	in: 'in'
};

const t = scoped('nti-site-admin.users.user.Identity', DEFAULT_TEXT);

SiteAdminUserIdentity.propTypes = {
	enrollment: PropTypes.object
};
export default function SiteAdminUserIdentity ({enrollment}) {
	const {UserProfile: user, CourseInstance} = (enrollment || {});

	return (
		<div className="site-admin-user-enrollment-identity">
			<div className="profile-image">
				<Presentation.Asset contentPackage={CourseInstance && CourseInstance.CatalogEntry} type="landing">
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
					{CourseInstance && CourseInstance.CatalogEntry.Title}
				</div>
			</div>
		</div>
	);
}
