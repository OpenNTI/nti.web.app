import React from 'react';

import Card from '../../common/Card';

import Tabs from './Tabs';

export default function SiteAdminAdvancedNav(props) {
	return (
		<Card>
			<Tabs {...props} />
		</Card>
	);
}
