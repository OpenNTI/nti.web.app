import {Router, Route} from '@nti/web-routing';// eslint-disable-line

import LearnerTable from './table/LearnersTable';
import AdminTable from './table/AdminsTable';
import InvitationsTable from './table/InvitationsTable';
import Frame from './Frame';

export default Router.for([
	Route({path: '/admins', component: AdminTable, name: 'site-admin.users.user-list-admins'}),
	Route({path: '/invitations', component: InvitationsTable, name: 'site-admin.users.user-list-invitations'}),
	Route({
		path: '/',
		component: LearnerTable,
		name: 'site-admin.users.user-list-users',
		getRouteFor (obj, context) {
			if (obj.MimeType === 'application/vnd.nextthought.user' && context === 'site-admin.users-list-item') {
				return `/user/${(obj.getID())}`;
			}
			else if (obj.MimeType === 'application/vnd.nextthought.user' && context === 'site-admin.admins-list-item') {
				return `/admins/user/${(obj.getID())}`;
			}

			return null;
		}
	}),
], {frame: Frame});
