import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {encodeForURI} from 'nti-lib-ntiids';
import {LinkTo} from 'nti-web-routing';

import Tabs from '../../../common/Tabs';

const DEFAULT_TEXT = {
	overview: 'Overview',
	roster: 'Roster',
	reports: 'Reports'
};
const t = scoped('nti-site-admin.courses.info.nav-bar.Tabs', DEFAULT_TEXT);

SiteAdminCourseTabs.propTypes = {
	id: PropTypes.string
};
export default function SiteAdminCourseTabs ({id}) {
	return (
		<Tabs>
			<LinkTo.Path to={`${encodeForURI(id)}/`} activeClassName="active" exact>{t('overview')}</LinkTo.Path>
			<LinkTo.Path to={`${encodeForURI(id)}/roster`} activeClassName="active">{t('roster')}</LinkTo.Path>
			<LinkTo.Path to={`${encodeForURI(id)}/reports`} activeClassName="active">{t('reports')}</LinkTo.Path>
		</Tabs>
	);
}
