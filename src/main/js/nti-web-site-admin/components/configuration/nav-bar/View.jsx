import { Suspense } from 'react';

import Card from '../../common/Card';

import Tabs from './Tabs';

export default function SiteAdminAdvancedNav(props) {
	return (
		<Suspense fallback={<div />}>
			<Card>
				<Tabs {...props} />
			</Card>
		</Suspense>
	);
}
