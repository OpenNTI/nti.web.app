import {Router, Route} from 'nti-web-routing';// eslint-disable-line
import {encodeForURI} from 'nti-lib-ntiids';

import List from './list';
import Info from './info';

export default Router.for([
	Route({
		path: '/:id',
		component: Info,
		getRouteFor: (obj, context) => {
			if (obj.MimeType === 'application/vnd.nextthought.courses.courseinstance' && context === 'site-admin.course-list-item') {
				return `/${encodeForURI(obj.getID())}`;
			}

			return null;
		}
	}),
	Route({path: '/', component: List, name: 'site-admin.courses'})
]);
