import React from 'react';

import Card from '../../../common/Card';

import Identity from './Identity';
import Tabs from './Tabs';

export default function SiteAdminUserIdentity (props) {
	return (
		<Card className="site-admin-user-nav-bar">
			<Identity {...props} />
			<Tabs {...props} />
		</Card>
	);
}
