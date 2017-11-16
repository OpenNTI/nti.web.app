import {Router, Route} from 'nti-web-routing';// eslint-disable-line

import List from './list';
import User from './user';

export default Router.for([
	Route({
		path: '/:id',
		component: User,
		getRouteFor (obj) {
			if (obj.MimeType === 'application/vnd.nextthought.user') {
				return `/${(obj.getID())}`;
			}

			return null;
		}
	}),
	Route({path: '/', component: List, name: 'site-admin.users'})
]);
