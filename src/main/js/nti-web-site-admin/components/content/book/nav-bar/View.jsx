import React from 'react';

import Card from '../../../common/Card';

import Identity from './Identity';
import Tabs from './Tabs';

export default function SiteAdminBookNavBar (props) {
	return (
		<Card className="site-admin-course-nav-bar">
			<Identity {...props} />
			<Tabs {...props} />
		</Card>
	);
}
