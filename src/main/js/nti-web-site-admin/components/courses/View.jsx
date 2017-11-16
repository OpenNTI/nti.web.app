import {Router, Route} from 'nti-web-routing';// eslint-disable-line

import List from './list';
import Info from './info';

export default Router.for([
	Route({
		path: '/:id',
		component: Info,
		getRouteFor: (obj) => {
			if (obj.MimeType === 'application/vnd.nextthought.courses.coursecataloglegacyentry') {
				return `/${(obj.getID())}`;
			}

			return null;
		}
	}),
	Route({path: '/', component: List, name: 'site-admin.courses'})
]);
