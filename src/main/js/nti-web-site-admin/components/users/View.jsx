import { encodeForURI } from '@nti/lib-ntiids';
import { Router, Route } from '@nti/web-routing';

import FiterableUserList from './list';
import User from './user';
import Segment from './segment/View';

export default Router.for(
	[
		Route({
			path: '/user/:userID',
			component: User,
		}),
		Route({
			path: '/admins/user/:userID',
			component: User,
		}),
		Route({
			path: '/course-admins/user/:userID',
			component: User,
		}),
		Route({
			path: '/segments/:segmentID',
			component: Segment,
			getRouteFor(obj) {
				if (obj.isSegment) {
					return `/segments/${encodeForURI(obj.getID())}`;
				}
			},
		}),
		Route({
			path: '/',
			component: FiterableUserList,
			name: 'site-admin.users',
		}),
	],
	{ title: 'People' }
);
