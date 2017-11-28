import React from 'react';
import PropTypes from 'prop-types';

SiteAdminTabs.propTypes = {
	children: PropTypes.node
};
export default function SiteAdminTabs ({children}) {
	return (
		<ul className="site-admin-tabs">
			{React.Children.map(children, (tab, index) => {
				return (
					<li key={index}>
						{tab}
					</li>
				);
			})}
		</ul>
	);
}
