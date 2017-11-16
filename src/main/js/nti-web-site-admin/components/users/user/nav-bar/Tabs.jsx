import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line

const DEFAULT_TEXT = {
	transcript: 'Transcript',
	reports: 'Reports',
	overview: 'Overview'
};

const t = scoped('nti-site-admin.users.user.nav-bar.Tabs', DEFAULT_TEXT);

SiteAdminUserTabs.propTypes = {
	id: PropTypes.string
};
export default function SiteAdminUserTabs ({id}) {
	return (
		<ul className="site-admin-user-tabs">
			<li>
				<LinkTo.Path to={`${id}/`} activeClassName="active" exact>{t('overview')}</LinkTo.Path>
			</li>
			<li>
				<LinkTo.Path to={`${id}/transcript`} activeClassName="active">{t('transcript')}</LinkTo.Path>
			</li>
			<li>
				<LinkTo.Path to={`${id}/reports`} activeClassName="active">{t('reports')}</LinkTo.Path>
			</li>
		</ul>
	);
}
