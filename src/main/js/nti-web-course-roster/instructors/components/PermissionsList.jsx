import React from 'react';
import PropTypes from 'prop-types';

import PermissionsListItem from './PermissionsListItem';

PermissionsList.propTypes = {
	permissionsList: PropTypes.array
};
export default function PermissionsList ({permissionsList = []}) {
	return (
		<ul className="course-instructor-permission-list">
			{permissionsList.map((p) => {
				return (
					<li key={p.id}>
						<PermissionsListItem permissions={p} />
					</li>
				);
			})}
		</ul>
	);
}
