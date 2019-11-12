import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Navigation} from '@nti/web-content';

const t = scoped('nti-web-site-admin.Frame', {
	dashboard: 'Dashboard',
	people: 'People',
	content: 'Content',
	reports: 'Reports',
	advanced: 'Advanced'
});

const tabs = [
	{ id: 'dashboard', label: t('dashboard'), isRoot: true },
	{ id: 'people', label: t('people')},
	{ id: 'content', label: t('content')},
	{ id: 'reports', label: t('reports')},
	{ id: 'advanced', label: t('advanced')}
];

SiteAdminFame.propTypes = {
	workspace: PropTypes.object,
	children: PropTypes.node
};
export default function SiteAdminFame ({workspace, children}) {
	return (
		<>
			<Navigation.Tabs content={workspace} tabs={tabs}/>
			{children}
		</>
	);
}
