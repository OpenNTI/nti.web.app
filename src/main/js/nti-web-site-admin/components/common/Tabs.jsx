import React from 'react';
import PropTypes from 'prop-types';
import {List} from '@nti/web-commons';

SiteAdminTabs.propTypes = {
	children: PropTypes.node
};
export default function SiteAdminTabs ({children}) {
	return (
		<List.Unadorned className="site-admin-tabs">
			{React.Children.map(children, (tab, index) => {
				return (
					<li key={index}>
						{tab}
					</li>
				);
			})}
		</List.Unadorned>
	);
}
