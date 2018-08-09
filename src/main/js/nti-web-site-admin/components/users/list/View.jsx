import {Router, Route} from '@nti/web-routing';// eslint-disable-line

import LearnerTable from './table/UsersTable';
import AdminTable from './table/AdminsTable';
import InvitationsTable from './table/InvitationsTable';
import FilterableUserList from './FilterableUserList';
import Frame from './Frame';

const f = (global.$AppConfig || {}).features || {};
const USE_NEW = Boolean(f['use-new-user-list']);

export default Router.for([
	Route({path: '/admins', component: AdminTable, name: 'site-admin.users.user-list-admins'}),
	Route({path: '/invitations', component: InvitationsTable, name: 'site-admin.users.user-list-invitations'}),
	Route({path: '/', component: LearnerTable, name: 'site-admin.users.user-list-users'}),
], {frame: USE_NEW ? Frame : FilterableUserList});
