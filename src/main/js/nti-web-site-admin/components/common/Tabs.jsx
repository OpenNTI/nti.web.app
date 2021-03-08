import './Tabs.scss';
import React from 'react';
import PropTypes from 'prop-types';

import { List } from '@nti/web-commons';

SiteAdminTabs.propTypes = {
	children: PropTypes.node,
	header: PropTypes.string,
};
export default function SiteAdminTabs({ children, header }) {
	return (
		<div className="site-admin-tabs-container">
			{header && (
				<div className="site-admin-tabs-header">
					<span className="site-admin-tabs-toc-icon" />
					<span>{header}</span>
				</div>
			)}
			<List.Unadorned className="site-admin-tabs">
				{React.Children.map(children, (tab, index) => {
					return <li key={index}>{tab}</li>;
				})}
			</List.Unadorned>
		</div>
	);
}
