import {Router, Route} from 'nti-web-routing';// eslint-disable-line

import List from './list';
import Info from './info';

export default Router.for([
	Route({
		path: '/:id',
		component: Info,
		getRouteFor: (obj, context) => {
			if (obj.MimeType === 'application/vnd.nextthought.courseware.courseinstanceadministrativerole' && context === 'site-admin.course-list-item') {
				return `/${(obj.getID())}`;
			}

			return null;
		}
	}),
	Route({path: '/', component: List, name: 'site-admin.courses'})
]);
