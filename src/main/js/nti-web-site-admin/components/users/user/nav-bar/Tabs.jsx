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
		<div className="site-admin-user-tabs">
			<LinkTo.Path to={`${id}/`}>
				{t('overview')}
			</LinkTo.Path>
			<LinkTo.Path to={`${id}/transcript`}>
				{t('transcript')}
			</LinkTo.Path>
			<LinkTo.Path to={`${id}/reports`}>
				{t('reports')}
			</LinkTo.Path>
		</div>
	);
}
