import { Router, Route } from '@nti/web-routing';

import LearnerTable from './table/LearnersTable';
import AdminTable from './table/AdminsTable';
import DeactivatedTable from './table/DeactivatedTable';
import InvitationsTable from './invitations/View';
import { CourseAdmins } from './course-admins/View';
import { Segments } from './segments/View';
import Frame from './Frame';

export default Router.for(
	[
		Route({
			path: '/admins',
			component: AdminTable,
			name: 'site-admin.users.user-list-admins',
		}),
		Route({
			path: '/deactivated',
			component: DeactivatedTable,
			name: 'site-admin.users.user-list-deactivated',
		}),
		Route({
			path: '/invitations',
			component: InvitationsTable,
			name: 'site-admin.users.user-list-invitations',
		}),
		Route({
			path: '/course-admins',
			component: CourseAdmins,
			name: 'site-admins.users.user-list-course-admins',
		}),
		Route({
			path: '/segments',
			component: Segments,
			name: 'site-admins.user.user-segments',
		}),
		Route({
			path: '/',
			component: LearnerTable,
			name: 'site-admin.users.user-list-users',
			getRouteFor(obj, context) {
				if (!obj?.MimeType === 'application/vnd.nextthought.user') {
					return null;
				}

				if (context === 'site-admin.users-list-item') {
					return `/user/${obj.getID()}`;
				} else if (context === 'site-admin.admins-list-item') {
					return `/admins/user/${obj.getID()}`;
				} else if (context === 'site-admin.course-admins-list-item') {
					return `/course-admins/user/${obj.getID()}`;
				}

				return null;
			},
		}),
	],
	{ frame: Frame }
);
