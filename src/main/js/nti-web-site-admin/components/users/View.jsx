import {Router, Route} from '@nti/web-routing';

import FiterableUserList from './list';
import User from './user';

export default Router.for([
	Route({
		path: '/user/:userID',
		component: User
	}),
	Route({
		path: '/admins/user/:userID',
		component: User
	}),
	Route({path: '/', component: FiterableUserList, name: 'site-admin.users'})
], {title: 'People'});
