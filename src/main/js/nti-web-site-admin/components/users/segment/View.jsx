import { Router, Route } from '@nti/web-routing';

import { SegmentRules } from './rules/View';

export default Router.for([
	Route({
		path: '/',
		component: SegmentRules,
	}),
]);
