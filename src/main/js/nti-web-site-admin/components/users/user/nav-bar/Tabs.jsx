import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';// eslint-disable-line

const DEFAULT_TEXT = {
	transcript: 'Transcript',
	courses: 'Courses',
	reports: 'Reports',
	overview: 'Overview'
};

const t = scoped('nti-site-admin.users.user.nav-bar.Tabs', DEFAULT_TEXT);

SiteAdminUserTabs.propTypes = {
	user: PropTypes.object.isRequired
};

export default function SiteAdminUserTabs ({user}) {
	return (
		<ul className="site-admin-user-tabs">
			<li>
				<LinkTo.Path to="./" activeClassName="active" exact>{t('overview')}</LinkTo.Path>
			</li>
			<li>
				<LinkTo.Path to="./courses" activeClassName="active">{t('courses')}</LinkTo.Path>
			</li>
			{
				user.hasLink('transcript') && (
					<li>
						<LinkTo.Path to="./transcript" activeClassName="active">{t('transcript')}</LinkTo.Path>
					</li>
				)
			}
			<li>
				<LinkTo.Path to="./reports" activeClassName="active">{t('reports')}</LinkTo.Path>
			</li>
		</ul>
	);
}
